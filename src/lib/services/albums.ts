import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import type { AlbumWithSeries, AlbumFilters, CreateAlbumInput, UpdateAlbumInput } from "@/lib/domain/types";

export async function getAlbums(filters?: AlbumFilters): Promise<AlbumWithSeries[]> {
  const where: Record<string, unknown> = {};

  if (filters?.search) {
    const term = normalize(filters.search);
    where.OR = [
      { normalizedTitle: { contains: term } },
      { normalizedAuthor: { contains: term } },
      { normalizedPublisher: { contains: term } },
      { series: { normalizedTitle: { contains: term } } },
    ];
  }

  if (filters?.seriesId) {
    where.seriesId = filters.seriesId;
  }

  if (filters?.author) {
    where.author = filters.author;
  }

  if (filters?.publisher) {
    where.publisher = filters.publisher;
  }

  if (filters?.isOriginalEdition !== undefined) {
    where.isOriginalEdition = filters.isOriginalEdition;
  }

  if (filters?.hasCover !== undefined) {
    where.coverImageUrl = filters.hasCover ? { not: null } : null;
  }

  const orderBy: Record<string, string> = {};
  if (filters?.sortField) {
    orderBy[filters.sortField] = filters.sortOrder || "asc";
  } else {
    orderBy.title = "asc";
  }

  return prisma.album.findMany({
    where,
    include: { series: { select: { id: true, title: true } } },
    orderBy,
  });
}

export async function getAlbumById(id: string): Promise<AlbumWithSeries | null> {
  return prisma.album.findUnique({
    where: { id },
    include: { series: { select: { id: true, title: true } } },
  });
}

export async function getAlbumsBySeriesId(seriesId: string): Promise<AlbumWithSeries[]> {
  return prisma.album.findMany({
    where: { seriesId },
    include: { series: { select: { id: true, title: true } } },
    orderBy: [{ volumeNumber: "asc" }, { title: "asc" }],
  });
}

export async function createAlbum(input: CreateAlbumInput) {
  return prisma.album.create({
    data: {
      seriesId: input.seriesId,
      title: input.title,
      normalizedTitle: normalize(input.title),
      author: input.author || null,
      normalizedAuthor: input.author ? normalize(input.author) : null,
      publisher: input.publisher || null,
      normalizedPublisher: input.publisher ? normalize(input.publisher) : null,
      publicationDate: input.publicationDate ? new Date(input.publicationDate) : null,
      volumeNumber: input.volumeNumber ?? null,
      summary: input.summary || null,
      isOriginalEdition: input.isOriginalEdition ?? false,
      personalNotes: input.personalNotes || null,
      isbn: input.isbn || null,
      ean: input.ean || null,
    },
    include: { series: { select: { id: true, title: true } } },
  });
}

export async function updateAlbum(input: UpdateAlbumInput) {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) {
    data.title = input.title;
    data.normalizedTitle = normalize(input.title);
  }
  if (input.author !== undefined) {
    data.author = input.author || null;
    data.normalizedAuthor = input.author ? normalize(input.author) : null;
  }
  if (input.publisher !== undefined) {
    data.publisher = input.publisher || null;
    data.normalizedPublisher = input.publisher ? normalize(input.publisher) : null;
  }
  if (input.seriesId !== undefined) data.seriesId = input.seriesId;
  if (input.publicationDate !== undefined) {
    data.publicationDate = input.publicationDate ? new Date(input.publicationDate) : null;
  }
  if (input.volumeNumber !== undefined) data.volumeNumber = input.volumeNumber;
  if (input.summary !== undefined) data.summary = input.summary || null;
  if (input.isOriginalEdition !== undefined) data.isOriginalEdition = input.isOriginalEdition;
  if (input.personalNotes !== undefined) data.personalNotes = input.personalNotes || null;
  if (input.isbn !== undefined) data.isbn = input.isbn || null;
  if (input.ean !== undefined) data.ean = input.ean || null;

  return prisma.album.update({
    where: { id: input.id },
    data,
    include: { series: { select: { id: true, title: true } } },
  });
}

export async function deleteAlbum(id: string) {
  return prisma.album.delete({ where: { id } });
}

export async function getDistinctAuthors(): Promise<string[]> {
  const albums = await prisma.album.findMany({
    where: { author: { not: null } },
    select: { author: true },
    distinct: ["author"],
    orderBy: { author: "asc" },
  });
  return albums.map((a) => a.author!).filter(Boolean);
}

export async function getDistinctAlbumPublishers(): Promise<string[]> {
  const albums = await prisma.album.findMany({
    where: { publisher: { not: null } },
    select: { publisher: true },
    distinct: ["publisher"],
    orderBy: { publisher: "asc" },
  });
  return albums.map((a) => a.publisher!).filter(Boolean);
}
