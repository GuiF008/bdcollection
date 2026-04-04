import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import type { ImportAlbumInput } from "@/lib/domain/types";
import {
  CatalogSource,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
} from "@/generated/prisma/enums";

function slugify(t: string): string {
  const s = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return s.length > 0 ? s : "serie";
}

const CACHE_FAR = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10);

export async function POST(request: NextRequest) {
  try {
    const data: ImportAlbumInput[] = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Le fichier doit contenir un tableau d'objets." },
        { status: 400 }
      );
    }

    const seriesCache = new Map<string, string>();
    let seriesCreated = 0;
    let albumsCreated = 0;
    const now = new Date();

    for (const item of data) {
      if (!item.serie || !item.titre) continue;

      const seriesKey = normalize(item.serie);
      let seriesRefId = seriesCache.get(seriesKey);

      if (!seriesRefId) {
        const sourceSeriesId = `csv-${seriesKey.slice(0, 120)}`;
        const existing = await prisma.seriesReference.findUnique({
          where: {
            source_sourceSeriesId: { source: CatalogSource.local, sourceSeriesId },
          },
        });

        if (existing) {
          seriesRefId = existing.id;
        } else {
          const created = await prisma.seriesReference.create({
            data: {
              source: CatalogSource.local,
              sourceSeriesId,
              sourceUrl: "",
              title: item.serie,
              slug: slugify(item.serie),
              albumCount: 0,
              firstFetchedAt: now,
              lastFetchedAt: now,
              cacheExpiresAt: CACHE_FAR(),
              sourceName: "import_csv",
            },
          });
          seriesRefId = created.id;
          seriesCreated++;
        }
        seriesCache.set(seriesKey, seriesRefId);
      }

      const externalId = `csv-${randomBytes(10).toString("hex")}`;
      const albumRef = await prisma.albumReference.create({
        data: {
          seriesReferenceId: seriesRefId,
          externalId,
          title: item.titre,
          authors: item.auteur || null,
          publisher: item.editeur || null,
          publicationDate: item.dateParution ? new Date(item.dateParution) : null,
          volumeNumber: item.tome ?? null,
          summary: item.resume || null,
          isbn: item.isbn || null,
          sourceName: "import_csv",
        },
      });

      await prisma.collectionItem.create({
        data: {
          albumReferenceId: albumRef.id,
          ownershipStatus: OwnershipStatus.OWNED,
          editionStatus: item.editionOriginale ? EditionStatus.FIRST_EDITION : EditionStatus.UNKNOWN,
          editionConfidence: item.editionOriginale
            ? EditionConfidence.PROBABLE
            : EditionConfidence.TO_VERIFY,
          notes: item.notesPerso || null,
          metadataJson:
            item.ean != null
              ? { ean: item.ean }
              : undefined,
        },
      });

      albumsCreated++;
    }

    for (const id of seriesCache.values()) {
      const count = await prisma.albumReference.count({ where: { seriesReferenceId: id } });
      await prisma.seriesReference.update({
        where: { id },
        data: { albumCount: count },
      });
    }

    return NextResponse.json({ seriesCreated, albumsCreated });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import des données." },
      { status: 500 }
    );
  }
}
