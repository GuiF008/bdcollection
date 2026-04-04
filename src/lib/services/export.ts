import { prisma } from "@/lib/db/prisma";
import { OwnershipStatus } from "@/generated/prisma/enums";

export async function exportAlbumsJSON() {
  const items = await prisma.collectionItem.findMany({
    where: { ownershipStatus: OwnershipStatus.OWNED },
    include: {
      albumReference: {
        include: {
          seriesReference: { select: { title: true } },
        },
      },
    },
    orderBy: [
      { albumReference: { seriesReference: { title: "asc" } } },
      { albumReference: { volumeNumber: "asc" } },
      { albumReference: { title: "asc" } },
    ],
  });

  return items.map((row) => {
    const a = row.albumReference;
    const meta = (row.metadataJson as { ean?: string } | null) ?? {};
    return {
      serie: a.seriesReference.title,
      titre: a.title,
      auteur: a.authors,
      editeur: a.publisher,
      dateParution: a.publicationDate?.toISOString().split("T")[0] || null,
      tome: a.volumeNumber,
      resume: a.summary,
      editionOriginale: row.editionStatus === "FIRST_EDITION",
      notesPerso: row.notes,
      isbn: a.isbn,
      ean: meta.ean ?? null,
    };
  });
}

export async function exportAlbumsCSV(): Promise<string> {
  const albums = await exportAlbumsJSON();

  const headers = [
    "Serie",
    "Titre",
    "Auteur",
    "Editeur",
    "Date de parution",
    "Tome",
    "Resume",
    "Edition originale",
    "Notes",
    "ISBN",
    "EAN",
  ];

  const rows = albums.map((album) => [
    escapeCsv(album.serie),
    escapeCsv(album.titre),
    escapeCsv(album.auteur || ""),
    escapeCsv(album.editeur || ""),
    album.dateParution || "",
    album.tome?.toString() || "",
    escapeCsv(album.resume || ""),
    album.editionOriginale ? "Oui" : "Non",
    escapeCsv(album.notesPerso || ""),
    album.isbn || "",
    album.ean || "",
  ]);

  return [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
}

function escapeCsv(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportSeriesJSON() {
  const series = await prisma.seriesReference.findMany({
    include: {
      _count: { select: { albums: true } },
      albums: {
        where: {
          collectionItems: { some: { ownershipStatus: OwnershipStatus.OWNED } },
        },
        select: { id: true },
      },
    },
    orderBy: { title: "asc" },
  });

  return series.map((s) => ({
    titre: s.title,
    description: s.summary,
    source: s.source,
    nombreAlbumsReferences: s._count.albums,
    nombreAlbumsEnCollection: s.albums.length,
  }));
}
