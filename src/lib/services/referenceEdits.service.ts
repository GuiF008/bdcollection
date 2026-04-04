import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type UpdateAlbumReferenceInput = {
  title?: string;
  subtitle?: string | null;
  authors?: string | null;
  publisher?: string | null;
  publicationDate?: Date | null;
  volumeNumber?: number | null;
  volumeLabel?: string | null;
  isbn?: string | null;
  summary?: string | null;
  coverImageUrl?: string | null;
  editionLabel?: string | null;
};

export async function updateAlbumReferenceById(id: string, data: UpdateAlbumReferenceInput) {
  const patch: Prisma.AlbumReferenceUpdateInput = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.subtitle !== undefined) patch.subtitle = data.subtitle;
  if (data.authors !== undefined) patch.authors = data.authors;
  if (data.publisher !== undefined) patch.publisher = data.publisher;
  if (data.publicationDate !== undefined) patch.publicationDate = data.publicationDate;
  if (data.volumeNumber !== undefined) patch.volumeNumber = data.volumeNumber;
  if (data.volumeLabel !== undefined) patch.volumeLabel = data.volumeLabel;
  if (data.isbn !== undefined) patch.isbn = data.isbn;
  if (data.summary !== undefined) patch.summary = data.summary;
  if (data.coverImageUrl !== undefined) patch.coverImageUrl = data.coverImageUrl;
  if (data.editionLabel !== undefined) patch.editionLabel = data.editionLabel;

  return prisma.albumReference.update({
    where: { id },
    data: patch,
  });
}

export type UpdateSeriesReferenceInput = {
  title?: string;
  summary?: string | null;
  universe?: string | null;
  authors?: string | null;
  publisher?: string | null;
  coverImageUrl?: string | null;
};

export async function updateSeriesReferenceById(id: string, data: UpdateSeriesReferenceInput) {
  const patch: Prisma.SeriesReferenceUpdateInput = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.summary !== undefined) patch.summary = data.summary;
  if (data.universe !== undefined) patch.universe = data.universe;
  if (data.authors !== undefined) patch.authors = data.authors;
  if (data.publisher !== undefined) patch.publisher = data.publisher;
  if (data.coverImageUrl !== undefined) patch.coverImageUrl = data.coverImageUrl;

  return prisma.seriesReference.update({
    where: { id },
    data: patch,
  });
}
