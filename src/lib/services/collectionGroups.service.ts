import { prisma } from "@/lib/db/prisma";

export async function listCollectionGroups() {
  return prisma.collectionGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
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
