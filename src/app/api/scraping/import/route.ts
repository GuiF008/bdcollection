import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CatalogSource, ImportJobStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { isCacheStale } from "@/server/scraping/utils/dates";
import { extractSourceSeriesIdFromSerieUrl } from "@/server/scraping/parsers/bedetheque-series.parser";
import { runCatalogImport } from "@/server/scraping/services/import-series.service";
import { getSeriesReferenceById, withStaleFlag } from "@/server/scraping/services/series-cache.service";
import { normalizeSerieUrl } from "@/server/scraping/services/url-normalize";

const bodySchema = z.object({
  source: z.literal("bedetheque"),
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Corps invalide", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { url } = parsed.data;
    const normalizedUrl = normalizeSerieUrl(url);
    const sourceSeriesId = extractSourceSeriesIdFromSerieUrl(normalizedUrl);
    if (!sourceSeriesId) {
      return NextResponse.json(
        { error: "URL de série Bedetheque attendue (…/serie-<id>-BD-….html)" },
        { status: 400 }
      );
    }

    const existing = await prisma.seriesReference.findUnique({
      where: {
        source_sourceSeriesId: {
          source: CatalogSource.bedetheque,
          sourceSeriesId,
        },
      },
    });

    if (existing) {
      const full = await getSeriesReferenceById(existing.id);
      return NextResponse.json({
        fromCache: true,
        stale: isCacheStale(existing.cacheExpiresAt),
        series: full ? { ...withStaleFlag(full), albums: full.albums } : withStaleFlag(existing),
        message:
          "Série déjà présente en cache. Utilisez POST /api/scraping/refresh pour forcer une mise à jour.",
      });
    }

    const result = await runCatalogImport({
      source: CatalogSource.bedetheque,
      url: normalizedUrl,
    });

    if (result.status === ImportJobStatus.failed) {
      return NextResponse.json(
        {
          jobId: result.jobId,
          status: result.status,
          errorMessage: result.errorMessage,
          warnings: result.warnings,
        },
        { status: 502 }
      );
    }

    const full = result.seriesReferenceId
      ? await getSeriesReferenceById(result.seriesReferenceId)
      : null;

    return NextResponse.json({
      fromCache: false,
      jobId: result.jobId,
      status: result.status,
      warnings: result.warnings,
      series: full
        ? { ...withStaleFlag(full), albums: full.albums }
        : { id: result.seriesReferenceId },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    const status = message.includes("déjà en cours") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
