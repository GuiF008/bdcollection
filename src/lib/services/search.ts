import { prisma } from "@/lib/db/prisma";

export async function globalSearch(query: string) {
  if (!query || query.trim().length === 0) {
    return { albums: [], series: [] };
  }

  const q = query.trim();

  const [albums, series] = await Promise.all([
    prisma.albumReference.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { authors: { contains: q, mode: "insensitive" } },
          { publisher: { contains: q, mode: "insensitive" } },
          { seriesReference: { title: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { seriesReference: { select: { id: true, title: true } } },
      orderBy: { title: "asc" },
      take: 20,
    }),
    prisma.seriesReference.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { _count: { select: { albums: true } } },
      orderBy: { title: "asc" },
      take: 10,
    }),
  ]);

  return { albums, series };
}
