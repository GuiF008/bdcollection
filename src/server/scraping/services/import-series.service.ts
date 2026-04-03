import { prisma } from "@/lib/db/prisma";
import { CatalogSource, ImportJobStatus } from "@/generated/prisma/enums";
import { BedethequeProvider } from "../providers/bedetheque-provider";
import { extractSourceSeriesIdFromSerieUrl } from "../parsers/bedetheque-series.parser";
import { scrapeLog } from "../utils/logger";
import { normalizeSerieUrl } from "./url-normalize";
import {
  toCatalogAlbumUpsert,
  toCatalogSeriesCreate,
  toCatalogSeriesUpdate,
} from "./catalog-mapper";

async function appendJobLog(jobId: string, line: string) {
  const current = await prisma.importJob.findUnique({
    where: { id: jobId },
    select: { logs: true },
  });
  const next = `${current?.logs ?? ""}${line}\n`;
  await prisma.importJob.update({
    where: { id: jobId },
    data: { logs: next },
  });
}

function providerFor(source: CatalogSource) {
  if (source === CatalogSource.bedetheque) return new BedethequeProvider();
  throw new Error(`Source non supportée: ${source}`);
}

export type ImportCatalogResult = {
  jobId: string;
  catalogSeriesId: string | null;
  status: ImportJobStatus;
  warnings: string[];
  errorMessage: string | null;
};

export async function runCatalogImport(params: {
  source: CatalogSource;
  url: string;
  jobId?: string;
}): Promise<ImportCatalogResult> {
  const normalizedUrl = normalizeSerieUrl(params.url);
  const sourceSeriesId = extractSourceSeriesIdFromSerieUrl(normalizedUrl);
  if (!sourceSeriesId) {
    throw new Error("URL de série Bedetheque invalide");
  }

  const existingSeries = await prisma.catalogSeries.findUnique({
    where: {
      source_sourceSeriesId: {
        source: params.source,
        sourceSeriesId,
      },
    },
  });

  const orRunning: Array<{ sourceUrl: string } | { catalogSeriesId: string }> = [
    { sourceUrl: normalizedUrl },
  ];
  if (existingSeries) {
    orRunning.push({ catalogSeriesId: existingSeries.id });
  }

  const running = await prisma.importJob.findFirst({
    where: {
      status: ImportJobStatus.running,
      source: params.source,
      OR: orRunning,
    },
  });

  if (running) {
    throw new Error(`Un import est déjà en cours (job ${running.id})`);
  }

  const job =
    params.jobId != null
      ? await prisma.importJob.update({
          where: { id: params.jobId },
          data: {
            status: ImportJobStatus.running,
            startedAt: new Date(),
            errorMessage: null,
          },
        })
      : await prisma.importJob.create({
          data: {
            source: params.source,
            sourceUrl: normalizedUrl,
            status: ImportJobStatus.running,
            startedAt: new Date(),
            catalogSeriesId: existingSeries?.id ?? null,
          },
        });

  const warnings: string[] = [];

  try {
    await appendJobLog(job.id, `Démarrage import ${normalizedUrl}`);
    const prov = providerFor(params.source);
    if (!prov.supportsUrl(normalizedUrl)) {
      throw new Error("URL non supportée par le provider");
    }

    const result = await prov.fetchSeries(normalizedUrl);
    warnings.push(...result.warnings);

    for (const w of result.warnings) {
      await appendJobLog(job.id, `Avertissement: ${w}`);
    }

    const now = new Date();
    const series = result.series;
    const sourceSeriesKey = series.sourceSeriesId;
    const seriesTitle = series.titre;
    const seriesSlug = series.slug;
    if (!sourceSeriesKey || !seriesTitle || !seriesSlug) {
      throw new Error("Métadonnées série insuffisantes après parsing");
    }

    const albumCount = result.albums.filter((a) => a.sourceAlbumId).length;

    const catalogSeries = await prisma.$transaction(async (tx) => {
      const upserted = await tx.catalogSeries.upsert({
        where: {
          source_sourceSeriesId: {
            source: params.source,
            sourceSeriesId: sourceSeriesKey,
          },
        },
        create: toCatalogSeriesCreate(series, now, albumCount),
        update: {
          ...toCatalogSeriesUpdate(series, now, albumCount),
        },
      });

      for (const album of result.albums) {
        if (!album.sourceAlbumId) continue;
        try {
          const { create, update } = toCatalogAlbumUpsert(upserted.id, album, now);
          await tx.catalogAlbum.upsert({
            where: {
              catalogSeriesId_sourceAlbumId: {
                catalogSeriesId: upserted.id,
                sourceAlbumId: album.sourceAlbumId,
              },
            },
            create,
            update,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          warnings.push(`Album ${album.sourceAlbumId}: ${msg}`);
        }
      }

      return upserted;
    });

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status:
          warnings.length > 0 ? ImportJobStatus.partial_success : ImportJobStatus.success,
        finishedAt: new Date(),
        catalogSeriesId: catalogSeries.id,
        errorMessage: null,
      },
    });

    await appendJobLog(job.id, `Terminé: ${albumCount} album(s) en base`);

    scrapeLog.info("import catalogue OK", {
      jobId: job.id,
      catalogSeriesId: catalogSeries.id,
      albums: albumCount,
    });

    return {
      jobId: job.id,
      catalogSeriesId: catalogSeries.id,
      status:
        warnings.length > 0 ? ImportJobStatus.partial_success : ImportJobStatus.success,
      warnings,
      errorMessage: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await appendJobLog(job.id, `Erreur: ${message}`);
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: ImportJobStatus.failed,
        finishedAt: new Date(),
        errorMessage: message,
      },
    });
    scrapeLog.error("import catalogue échoué", e);
    return {
      jobId: job.id,
      catalogSeriesId: existingSeries?.id ?? null,
      status: ImportJobStatus.failed,
      warnings,
      errorMessage: message,
    };
  }
}
