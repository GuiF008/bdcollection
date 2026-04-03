import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import type { SearchResult } from "@/lib/domain/types";

export async function globalSearch(query: string): Promise<SearchResult> {
  if (!query || query.trim().length === 0) {
    return { albums: [], series: [] };
  }

  const term = normalize(query);

  const [albums, series] = await Promise.all([
    prisma.album.findMany({
      where: {
        OR: [
          { normalizedTitle: { contains: term } },
          { normalizedAuthor: { contains: term } },
          { normalizedPublisher: { contains: term } },
          { series: { normalizedTitle: { contains: term } } },
        ],
      },
      include: { series: { select: { id: true, title: true } } },
      orderBy: { title: "asc" },
      take: 20,
    }),
    prisma.series.findMany({
      where: {
        OR: [
          { normalizedTitle: { contains: term } },
        ],
      },
      include: { _count: { select: { albums: true } } },
      orderBy: { title: "asc" },
      take: 10,
    }),
  ]);

  return { albums, series };
}
