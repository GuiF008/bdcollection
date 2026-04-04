import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "@/generated/prisma/enums";

export type CatalogSeriesListFilters = {
  search?: string;
};

export async function getSeriesReferencesForCatalog(filters?: CatalogSeriesListFilters) {
  const where: Prisma.SeriesReferenceWhereInput = {};
  if (filters?.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.seriesReference.findMany({
    where,
    orderBy: { title: "asc" },
    include: {
      _count: { select: { albums: true } },
    },
  });
}

/** Albums du catalogue avec indicateurs possession / EO (pour la fiche série). */
export async function getAlbumsForSeriesCatalog(seriesReferenceId: string) {
  const albums = await prisma.albumReference.findMany({
    where: { seriesReferenceId },
    orderBy: [{ volumeNumber: "asc" }, { volumeLabel: "asc" }, { title: "asc" }],
    include: {
      collectionItems: true,
    },
  });

  return albums.map((al) => {
    const owned = al.collectionItems.some((c) => c.ownershipStatus === OwnershipStatus.OWNED);
    const wanted = al.collectionItems.some(
      (c) =>
        c.ownershipStatus === OwnershipStatus.WANTED ||
        c.ownershipStatus === OwnershipStatus.HUNTING ||
        c.searchStatus === SearchStatus.WANTED ||
        c.searchStatus === SearchStatus.HUNTING
    );
    const eoConfirmed =
      owned &&
      al.collectionItems.some(
        (c) =>
          c.ownershipStatus === OwnershipStatus.OWNED &&
          c.editionStatus === EditionStatus.FIRST_EDITION &&
          c.editionConfidence === EditionConfidence.CONFIRMED
      );
    const eoToVerify =
      owned &&
      al.collectionItems.some(
        (c) =>
          c.ownershipStatus === OwnershipStatus.OWNED &&
          (c.editionConfidence === EditionConfidence.TO_VERIFY ||
            c.editionConfidence === EditionConfidence.PROBABLE)
      );
    const duplicate = al.collectionItems.some(
      (c) => c.isDuplicate || c.ownershipStatus === OwnershipStatus.DUPLICATE
    );
    const primaryItem = al.collectionItems[0] ?? null;
    const tracked = al.collectionItems.length > 0;
    return {
      ...al,
      flags: { owned, wanted, tracked, eoConfirmed, eoToVerify, duplicate },
      primaryItem,
    };
  });
}
