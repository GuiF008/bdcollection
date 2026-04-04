import { prisma } from "@/lib/db/prisma";
import { isCacheStale } from "../utils/dates";

export async function getSeriesReferenceById(id: string) {
  return prisma.seriesReference.findUnique({
    where: { id },
    include: {
      albums: {
        orderBy: [{ volumeNumber: "asc" }, { volumeLabel: "asc" }, { title: "asc" }],
        include: {
          collectionItems: true,
        },
      },
    },
  });
}

export async function searchSeriesReferences(query: string, take = 20) {
  const q = query.trim();
  if (!q) return [];

  return prisma.seriesReference.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    take,
    orderBy: { title: "asc" },
  });
}

export function withStaleFlag<T extends { cacheExpiresAt: Date }>(row: T) {
  return {
    ...row,
    isStale: isCacheStale(row.cacheExpiresAt),
  };
}
