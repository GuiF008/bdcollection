import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import type { ImportAlbumInput } from "@/lib/domain/types";

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

    for (const item of data) {
      if (!item.serie || !item.titre) continue;

      const seriesKey = normalize(item.serie);
      let seriesId = seriesCache.get(seriesKey);

      if (!seriesId) {
        const existing = await prisma.series.findFirst({
          where: { normalizedTitle: seriesKey },
        });

        if (existing) {
          seriesId = existing.id;
        } else {
          const newSeries = await prisma.series.create({
            data: {
              title: item.serie,
              normalizedTitle: seriesKey,
              publisher: item.editeur || null,
            },
          });
          seriesId = newSeries.id;
          seriesCreated++;
        }
        seriesCache.set(seriesKey, seriesId);
      }

      await prisma.album.create({
        data: {
          seriesId,
          title: item.titre,
          normalizedTitle: normalize(item.titre),
          author: item.auteur || null,
          normalizedAuthor: item.auteur ? normalize(item.auteur) : null,
          publisher: item.editeur || null,
          normalizedPublisher: item.editeur ? normalize(item.editeur) : null,
          publicationDate: item.dateParution ? new Date(item.dateParution) : null,
          volumeNumber: item.tome ?? null,
          summary: item.resume || null,
          isOriginalEdition: item.editionOriginale ?? false,
          personalNotes: item.notesPerso || null,
          isbn: item.isbn || null,
          ean: item.ean || null,
        },
      });
      albumsCreated++;
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
