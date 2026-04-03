import { prisma } from "@/lib/db/prisma";

export async function exportAlbumsJSON() {
  const albums = await prisma.album.findMany({
    include: { series: { select: { title: true } } },
    orderBy: [{ series: { title: "asc" } }, { volumeNumber: "asc" }, { title: "asc" }],
  });

  return albums.map((album) => ({
    serie: album.series.title,
    titre: album.title,
    auteur: album.author,
    editeur: album.publisher,
    dateParution: album.publicationDate?.toISOString().split("T")[0] || null,
    tome: album.volumeNumber,
    resume: album.summary,
    editionOriginale: album.isOriginalEdition,
    notesPerso: album.personalNotes,
    isbn: album.isbn,
    ean: album.ean,
  }));
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
  const series = await prisma.series.findMany({
    include: { _count: { select: { albums: true } } },
    orderBy: { title: "asc" },
  });

  return series.map((s) => ({
    titre: s.title,
    description: s.description,
    auteurs: s.authors,
    editeur: s.publisher,
    notesPerso: s.personalNotes,
    nombreAlbums: s._count.albums,
  }));
}
