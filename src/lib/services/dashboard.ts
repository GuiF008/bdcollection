import { prisma } from "@/lib/db/prisma";
import type { DashboardStats } from "@/lib/domain/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalAlbums, totalSeries, originalEditions, recentAlbums, publisherData, authorData] =
    await Promise.all([
      prisma.album.count(),
      prisma.series.count(),
      prisma.album.count({ where: { isOriginalEdition: true } }),
      prisma.album.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { series: { select: { id: true, title: true } } },
      }),
      prisma.album.groupBy({
        by: ["publisher"],
        where: { publisher: { not: null } },
        _count: { publisher: true },
        orderBy: { _count: { publisher: "desc" } },
        take: 10,
      }),
      prisma.album.groupBy({
        by: ["author"],
        where: { author: { not: null } },
        _count: { author: true },
        orderBy: { _count: { author: "desc" } },
        take: 10,
      }),
    ]);

  return {
    totalAlbums,
    totalSeries,
    originalEditions,
    recentAlbums,
    publisherDistribution: publisherData.map((p) => ({
      publisher: p.publisher || "Inconnu",
      count: p._count.publisher,
    })),
    authorDistribution: authorData.map((a) => ({
      author: a.author || "Inconnu",
      count: a._count.author,
    })),
  };
}
