import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";

const EXTERNAL_SOURCE = "bedetheque";

export type ImportCatalogMode = "new_series" | "existing_series";

export type ImportCatalogToCollectionResult =
  | {
      ok: true;
      collectionSeriesId: string;
      albumsCreated: number;
      albumsSkipped: number;
    }
  | { ok: false; error: string };

/**
 * Copie une série catalogue (Bedetheque) vers la collection personnelle (Series / Album).
 * Ignore les albums déjà liés (même externalSource + externalId ou même ISBN dans la série).
 */
export async function importCatalogSeriesToCollection(params: {
  catalogSeriesId: string;
  mode: ImportCatalogMode;
  /** Requis si mode === existing_series */
  collectionSeriesId?: string;
}): Promise<ImportCatalogToCollectionResult> {
  const catalog = await prisma.catalogSeries.findUnique({
    where: { id: params.catalogSeriesId },
    include: {
      albums: {
        orderBy: [{ volumeNumber: "asc" }, { volumeLabel: "asc" }, { title: "asc" }],
      },
    },
  });

  if (!catalog) {
    return { ok: false, error: "Série catalogue introuvable." };
  }

  if (catalog.albums.length === 0) {
    return { ok: false, error: "Aucun album dans le cache à importer." };
  }

  let targetSeriesId: string;

  if (params.mode === "new_series") {
    const coverFromAlbum = catalog.albums.find((a) => a.coverImageUrl)?.coverImageUrl ?? null;
    const publisherGuess =
      catalog.albums.find((a) => a.publisher)?.publisher ?? null;

    const created = await prisma.series.create({
      data: {
        title: catalog.title,
        normalizedTitle: normalize(catalog.title),
        description: catalog.summary,
        publisher: publisherGuess,
        coverImageUrl: coverFromAlbum,
      },
    });
    targetSeriesId = created.id;
  } else {
    if (!params.collectionSeriesId) {
      return { ok: false, error: "Choisissez une série de destination." };
    }
    const existing = await prisma.series.findUnique({
      where: { id: params.collectionSeriesId },
    });
    if (!existing) {
      return { ok: false, error: "Série de collection introuvable." };
    }
    targetSeriesId = existing.id;
  }

  let albumsCreated = 0;
  let albumsSkipped = 0;

  await prisma.$transaction(async (tx) => {
    for (const ca of catalog.albums) {
      const byExternal = await tx.album.findFirst({
        where: {
          seriesId: targetSeriesId,
          externalSource: EXTERNAL_SOURCE,
          externalId: ca.sourceAlbumId,
        },
      });
      if (byExternal) {
        albumsSkipped++;
        continue;
      }

      if (ca.isbn) {
        const byIsbn = await tx.album.findFirst({
          where: { seriesId: targetSeriesId, isbn: ca.isbn },
        });
        if (byIsbn) {
          albumsSkipped++;
          continue;
        }
      }

      await tx.album.create({
        data: {
          seriesId: targetSeriesId,
          title: ca.title,
          normalizedTitle: normalize(ca.title),
          author: ca.authorsText,
          normalizedAuthor: ca.authorsText ? normalize(ca.authorsText) : null,
          publisher: ca.publisher,
          normalizedPublisher: ca.publisher ? normalize(ca.publisher) : null,
          publicationDate: ca.publicationDate,
          volumeNumber: ca.volumeNumber,
          summary: ca.summary,
          coverImageUrl: ca.coverImageUrl,
          isOriginalEdition: ca.isOriginalEdition ?? false,
          isbn: ca.isbn,
          editionLabel: ca.editionLabel,
          externalSource: EXTERNAL_SOURCE,
          externalId: ca.sourceAlbumId,
          lastSyncAt: new Date(),
        },
      });
      albumsCreated++;
    }
  });

  return {
    ok: true,
    collectionSeriesId: targetSeriesId,
    albumsCreated,
    albumsSkipped,
  };
}
