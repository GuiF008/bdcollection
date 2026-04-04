import { prisma } from "@/lib/db/prisma";
import { normalize } from "@/lib/domain/normalize";
import {
  CompletenessStatus,
  ConditionGrade,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export type CollectionListFilters = {
  search?: string;
  seriesReferenceId?: string;
  ownership?: OwnershipStatus | OwnershipStatus[];
  editionStatus?: EditionStatus;
  editionConfidence?: EditionConfidence;
  conditionMax?: ConditionGrade;
  duplicatesOnly?: boolean;
  missingPersonalPhoto?: boolean;
  publisher?: string;
  author?: string;
  /** Albums à chasser : pas possédés mais suivis */
  huntingOnly?: boolean;
  sortField?: "title" | "createdAt" | "purchaseDate";
  sortOrder?: "asc" | "desc";
};

const DEGRADED: ConditionGrade[] = [
  ConditionGrade.FAIR,
  ConditionGrade.POOR,
];

export async function getCollectionItemsWithRefs(filters?: CollectionListFilters) {
  const where: Prisma.CollectionItemWhereInput = {};

  if (filters?.ownership) {
    where.ownershipStatus = Array.isArray(filters.ownership)
      ? { in: filters.ownership }
      : filters.ownership;
  }

  if (filters?.editionStatus) {
    where.editionStatus = filters.editionStatus;
  }

  if (filters?.editionConfidence) {
    where.editionConfidence = filters.editionConfidence;
  }

  if (filters?.duplicatesOnly) {
    where.isDuplicate = true;
  }

  if (filters?.missingPersonalPhoto) {
    where.hasPersonalPhoto = false;
  }

  if (filters?.huntingOnly) {
    const huntingClause: Prisma.CollectionItemWhereInput = {
      OR: [
        { ownershipStatus: OwnershipStatus.HUNTING },
        { searchStatus: SearchStatus.HUNTING },
        { ownershipStatus: OwnershipStatus.WANTED },
        { searchStatus: SearchStatus.WANTED },
      ],
    };
    if (where.AND) {
      const existing = where.AND;
      where.AND = Array.isArray(existing) ? [...existing, huntingClause] : [existing, huntingClause];
    } else {
      where.AND = [huntingClause];
    }
  }

  if (filters?.conditionMax) {
    if (filters.conditionMax === ConditionGrade.FAIR) {
      where.conditionGrade = { in: DEGRADED };
    }
  }

  const albumRefWhere: Prisma.AlbumReferenceWhereInput = {};
  if (filters?.seriesReferenceId) {
    albumRefWhere.seriesReferenceId = filters.seriesReferenceId;
  }
  if (filters?.publisher) {
    albumRefWhere.publisher = filters.publisher;
  }
  if (filters?.author) {
    albumRefWhere.authors = { contains: filters.author, mode: "insensitive" };
  }
  if (Object.keys(albumRefWhere).length > 0) {
    where.albumReference = albumRefWhere;
  }

  if (filters?.search) {
    const term = normalize(filters.search);
    const searchOr: Prisma.CollectionItemWhereInput[] = [
      { notes: { contains: term, mode: "insensitive" } },
      {
        albumReference: {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { authors: { contains: term, mode: "insensitive" } },
            { publisher: { contains: term, mode: "insensitive" } },
            {
              seriesReference: {
                OR: [
                  { title: { contains: term, mode: "insensitive" } },
                  { summary: { contains: term, mode: "insensitive" } },
                  { authors: { contains: term, mode: "insensitive" } },
                  { publisher: { contains: term, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
      },
    ];
    const and: Prisma.CollectionItemWhereInput[] = [{ OR: searchOr }];
    if (where.AND) {
      const existing = where.AND;
      where.AND = Array.isArray(existing) ? [...existing, ...and] : [existing, ...and];
    } else {
      where.AND = and;
    }
  }

  const orderBy: Prisma.CollectionItemOrderByWithRelationInput[] = [];
  if (filters?.sortField === "purchaseDate") {
    orderBy.push({ purchaseDate: filters.sortOrder ?? "desc" });
  } else if (filters?.sortField === "createdAt") {
    orderBy.push({ createdAt: filters.sortOrder ?? "desc" });
  } else {
    orderBy.push({ albumReference: { title: filters?.sortOrder ?? "asc" } });
  }

  return prisma.collectionItem.findMany({
    where,
    include: {
      albumReference: {
        include: {
          seriesReference: {
            select: {
              id: true,
              title: true,
              slug: true,
              source: true,
              summary: true,
              universe: true,
              coverImageUrl: true,
              authors: true,
              publisher: true,
            },
          },
        },
      },
    },
    orderBy,
  });
}

export async function getOwnedCollectionItems(filters?: CollectionListFilters) {
  return getCollectionItemsWithRefs({
    ...filters,
    ownership: OwnershipStatus.OWNED,
  });
}

export async function getAlbumReferenceDetail(albumReferenceId: string) {
  return prisma.albumReference.findUnique({
    where: { id: albumReferenceId },
    include: {
      seriesReference: true,
      collectionItems: {
        orderBy: { createdAt: "asc" },
        include: {
          albumReference: {
            include: {
              seriesReference: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  source: true,
                  summary: true,
                  universe: true,
                  coverImageUrl: true,
                  authors: true,
                  publisher: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function upsertCollectionItemOwned(albumReferenceId: string) {
  const existing = await prisma.collectionItem.findFirst({
    where: { albumReferenceId, ownershipStatus: OwnershipStatus.OWNED },
  });
  if (existing) {
    return prisma.collectionItem.update({
      where: { id: existing.id },
      data: { ownershipStatus: OwnershipStatus.OWNED },
      include: {
        albumReference: { include: { seriesReference: true } },
      },
    });
  }
  const anyItem = await prisma.collectionItem.findFirst({
    where: { albumReferenceId },
    orderBy: { createdAt: "asc" },
  });
  if (anyItem) {
    return prisma.collectionItem.update({
      where: { id: anyItem.id },
      data: { ownershipStatus: OwnershipStatus.OWNED },
      include: {
        albumReference: { include: { seriesReference: true } },
      },
    });
  }
  return prisma.collectionItem.create({
    data: {
      albumReferenceId,
      ownershipStatus: OwnershipStatus.OWNED,
      editionStatus: EditionStatus.UNKNOWN,
      editionConfidence: EditionConfidence.TO_VERIFY,
    },
    include: {
      albumReference: { include: { seriesReference: true } },
    },
  });
}

export async function markAlbumWanted(albumReferenceId: string) {
  const existing = await prisma.collectionItem.findFirst({
    where: { albumReferenceId },
  });
  if (existing) {
    return prisma.collectionItem.update({
      where: { id: existing.id },
      data: {
        ownershipStatus: OwnershipStatus.WANTED,
        searchStatus: SearchStatus.WANTED,
      },
    });
  }
  return prisma.collectionItem.create({
    data: {
      albumReferenceId,
      ownershipStatus: OwnershipStatus.WANTED,
      searchStatus: SearchStatus.WANTED,
    },
  });
}

export async function markHunting(albumReferenceId: string) {
  const existing = await prisma.collectionItem.findFirst({
    where: { albumReferenceId },
  });
  if (existing) {
    return prisma.collectionItem.update({
      where: { id: existing.id },
      data: {
        ownershipStatus: OwnershipStatus.HUNTING,
        searchStatus: SearchStatus.HUNTING,
      },
    });
  }
  return prisma.collectionItem.create({
    data: {
      albumReferenceId,
      ownershipStatus: OwnershipStatus.HUNTING,
      searchStatus: SearchStatus.HUNTING,
    },
  });
}

export async function updateCollectionItem(
  id: string,
  data: {
    ownershipStatus?: OwnershipStatus;
    searchStatus?: SearchStatus;
    editionStatus?: EditionStatus;
    editionConfidence?: EditionConfidence;
    conditionGrade?: ConditionGrade;
    completenessStatus?: CompletenessStatus;
    notes?: string | null;
    purchasePrice?: number | null;
    purchaseDate?: Date | null;
    purchaseSource?: string | null;
    isDuplicate?: boolean;
    quantity?: number;
    hasPersonalPhoto?: boolean;
    personalPhotoUrl?: string | null;
  }
) {
  return prisma.collectionItem.update({
    where: { id },
    data,
    include: {
      albumReference: { include: { seriesReference: true } },
    },
  });
}

export async function removeCollectionItem(id: string) {
  return prisma.collectionItem.delete({ where: { id } });
}

export async function removeAllItemsForAlbumReference(albumReferenceId: string) {
  return prisma.collectionItem.deleteMany({ where: { albumReferenceId } });
}

export type DashboardV2Stats = {
  seriesImported: number;
  albumsReferenced: number;
  itemsInCollection: number;
  confirmedFirstEditions: number;
  missingOwned: number;
  duplicateCount: number;
  seriesProgress: Array<{
    id: string;
    title: string;
    coverImageUrl: string | null;
    totalRefs: number;
    owned: number;
    confirmedEo: number;
    missing: number;
  }>;
};

export async function getDashboardV2Stats(): Promise<DashboardV2Stats> {
  const [
    seriesImported,
    albumsReferenced,
    itemsInCollection,
    confirmedFirstEditions,
    duplicateRows,
    allSeries,
  ] = await Promise.all([
    prisma.seriesReference.count(),
    prisma.albumReference.count(),
    prisma.collectionItem.count({
      where: { ownershipStatus: OwnershipStatus.OWNED },
    }),
    prisma.collectionItem.count({
      where: {
        ownershipStatus: OwnershipStatus.OWNED,
        editionStatus: EditionStatus.FIRST_EDITION,
        editionConfidence: EditionConfidence.CONFIRMED,
      },
    }),
    prisma.collectionItem.count({ where: { isDuplicate: true } }),
    prisma.seriesReference.findMany({
      orderBy: { title: "asc" },
      include: {
        albums: {
          select: {
            id: true,
            collectionItems: {
              select: {
                ownershipStatus: true,
                editionStatus: true,
                editionConfidence: true,
              },
            },
          },
        },
      },
    }),
  ]);

  let missingOwned = 0;
  const seriesProgress = allSeries.map((sr) => {
    const totalRefs = sr.albums.length;
    let owned = 0;
    let confirmedEo = 0;
    for (const al of sr.albums) {
      const ownedItem = al.collectionItems.find((c) => c.ownershipStatus === OwnershipStatus.OWNED);
      if (ownedItem) {
        owned += 1;
        if (
          ownedItem.editionStatus === EditionStatus.FIRST_EDITION &&
          ownedItem.editionConfidence === EditionConfidence.CONFIRMED
        ) {
          confirmedEo += 1;
        }
      } else {
        missingOwned += 1;
      }
    }
    return {
      id: sr.id,
      title: sr.title,
      coverImageUrl: sr.coverImageUrl,
      totalRefs,
      owned,
      confirmedEo,
      missing: totalRefs - owned,
    };
  });

  return {
    seriesImported,
    albumsReferenced,
    itemsInCollection,
    confirmedFirstEditions,
    missingOwned,
    duplicateCount: duplicateRows,
    seriesProgress,
  };
}
