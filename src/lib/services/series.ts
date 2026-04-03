import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import type { SeriesWithCount, SeriesFilters, CreateSeriesInput, UpdateSeriesInput } from "@/lib/domain/types";

export async function getSeries(filters?: SeriesFilters): Promise<SeriesWithCount[]> {
  const where: Record<string, unknown> = {};

  if (filters?.search) {
    const term = normalize(filters.search);
    where.normalizedTitle = { contains: term };
  }

  if (filters?.publisher) {
    where.publisher = filters.publisher;
  }

  const orderBy: Record<string, string> = {};
  if (filters?.sortField) {
    orderBy[filters.sortField] = filters.sortOrder || "asc";
  } else {
    orderBy.title = "asc";
  }

  return prisma.series.findMany({
    where,
    include: { _count: { select: { albums: true } } },
    orderBy,
  });
}

export async function getSeriesById(id: string): Promise<SeriesWithCount | null> {
  return prisma.series.findUnique({
    where: { id },
    include: { _count: { select: { albums: true } } },
  });
}

export async function createSeries(input: CreateSeriesInput) {
  return prisma.series.create({
    data: {
      title: input.title,
      normalizedTitle: normalize(input.title),
      description: input.description || null,
      authors: input.authors || null,
      publisher: input.publisher || null,
      personalNotes: input.personalNotes || null,
    },
    include: { _count: { select: { albums: true } } },
  });
}

export async function updateSeries(input: UpdateSeriesInput) {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) {
    data.title = input.title;
    data.normalizedTitle = normalize(input.title);
  }
  if (input.description !== undefined) data.description = input.description || null;
  if (input.authors !== undefined) data.authors = input.authors || null;
  if (input.publisher !== undefined) data.publisher = input.publisher || null;
  if (input.personalNotes !== undefined) data.personalNotes = input.personalNotes || null;

  return prisma.series.update({
    where: { id: input.id },
    data,
    include: { _count: { select: { albums: true } } },
  });
}

export async function deleteSeries(id: string) {
  return prisma.series.delete({ where: { id } });
}

export async function getSeriesForSelect() {
  return prisma.series.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

export async function getDistinctPublishers(): Promise<string[]> {
  const series = await prisma.series.findMany({
    where: { publisher: { not: null } },
    select: { publisher: true },
    distinct: ["publisher"],
    orderBy: { publisher: "asc" },
  });
  return series.map((s) => s.publisher!).filter(Boolean);
}
