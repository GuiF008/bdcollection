import { prisma } from "@/lib/db/prisma";

export async function listCollectionGroups() {
  return prisma.collectionGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });
}

export type CollectionGroupDashboardRow = {
  id: string;
  name: string;
  _count: { memberships: number };
  /** Première série du groupe (ordre titre), pour vignette */
  previewCoverUrl: string | null;
  previewSeriesTitle: string | null;
};

/** Groupes avec couverture de la première série (alphabetique titre) pour le dashboard. */
export async function listCollectionGroupsForDashboard(): Promise<CollectionGroupDashboardRow[]> {
  const groups = await prisma.collectionGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { memberships: true } },
      memberships: {
        take: 1,
        orderBy: { seriesReference: { title: "asc" } },
        select: {
          seriesReference: {
            select: { title: true, coverImageUrl: true },
          },
        },
      },
    },
  });

  return groups.map((g) => {
    const sr = g.memberships[0]?.seriesReference;
    return {
      id: g.id,
      name: g.name,
      _count: g._count,
      previewCoverUrl: sr?.coverImageUrl ?? null,
      previewSeriesTitle: sr?.title ?? null,
    };
  });
}

export async function createCollectionGroup(name: string) {
  const n = name.trim();
  if (!n) throw new Error("Nom vide");
  return prisma.collectionGroup.create({ data: { name: n } });
}

export async function renameCollectionGroup(id: string, name: string) {
  const n = name.trim();
  if (!n) throw new Error("Nom vide");
  return prisma.collectionGroup.update({ where: { id }, data: { name: n } });
}

export async function deleteCollectionGroup(id: string) {
  await prisma.collectionGroup.delete({ where: { id } });
}

export async function getSeriesGroupIds(seriesReferenceId: string): Promise<string[]> {
  const rows = await prisma.seriesGroupMembership.findMany({
    where: { seriesReferenceId },
    select: { collectionGroupId: true },
  });
  return rows.map((r) => r.collectionGroupId);
}

export async function setSeriesCollectionGroups(seriesReferenceId: string, groupIds: string[]) {
  const uniq = [...new Set(groupIds)].filter(Boolean);
  await prisma.$transaction(async (tx) => {
    await tx.seriesGroupMembership.deleteMany({ where: { seriesReferenceId } });
    if (uniq.length > 0) {
      await tx.seriesGroupMembership.createMany({
        data: uniq.map((collectionGroupId) => ({ seriesReferenceId, collectionGroupId })),
      });
    }
  });
}

/** Ajoute un groupe à chaque série sans retirer les autres appartenances. */
export async function addSeriesToCollectionGroup(
  seriesReferenceIds: string[],
  collectionGroupId: string
) {
  const group = await prisma.collectionGroup.findUnique({ where: { id: collectionGroupId } });
  if (!group) throw new Error("Groupe inconnu");

  const uniqSeries = [...new Set(seriesReferenceIds)].filter(Boolean);
  if (uniqSeries.length === 0) return { count: 0 };

  await prisma.$transaction(async (tx) => {
    for (const seriesReferenceId of uniqSeries) {
      const existing = await tx.seriesGroupMembership.findMany({
        where: { seriesReferenceId },
        select: { collectionGroupId: true },
      });
      const merged = new Set(existing.map((e) => e.collectionGroupId));
      merged.add(collectionGroupId);
      await tx.seriesGroupMembership.deleteMany({ where: { seriesReferenceId } });
      await tx.seriesGroupMembership.createMany({
        data: [...merged].map((gid) => ({ seriesReferenceId, collectionGroupId: gid })),
      });
    }
  });

  return { count: uniqSeries.length };
}
