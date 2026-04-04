"use server";

import { revalidatePath } from "next/cache";
import {
  ensureCollectionTracking,
  markAlbumWanted,
  markHunting,
  removeCollectionItem,
  updateCollectionItem,
  upsertCollectionItemOwned,
} from "@/lib/services/collectionItems.service";
import {
  CompletenessStatus,
  ConditionGrade,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "@/generated/prisma/enums";

export async function addToTrackingAlbumAction(albumReferenceId: string) {
  await ensureCollectionTracking(albumReferenceId);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
}

export async function addOwnedAlbumAction(albumReferenceId: string) {
  await upsertCollectionItemOwned(albumReferenceId);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
}

export async function markWantedAlbumAction(albumReferenceId: string) {
  await markAlbumWanted(albumReferenceId);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
}

export async function markHuntingAlbumAction(albumReferenceId: string) {
  await markHunting(albumReferenceId);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
}

export async function removeFromCollectionAction(collectionItemId: string, albumReferenceId: string) {
  await removeCollectionItem(collectionItemId);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
}

export async function updateCollectionItemAction(
  collectionItemId: string,
  albumReferenceId: string,
  data: {
    ownershipStatus?: OwnershipStatus;
    searchStatus?: SearchStatus;
    editionStatus?: EditionStatus;
    editionConfidence?: EditionConfidence;
    conditionGrade?: ConditionGrade;
    completenessStatus?: CompletenessStatus;
    notes?: string | null;
    purchasePrice?: number | null;
    purchaseDate?: string | null;
    purchaseSource?: string | null;
    isDuplicate?: boolean;
    quantity?: number;
    hasPersonalPhoto?: boolean;
    personalPhotoUrl?: string | null;
  }
) {
  const { purchaseDate: pd, ...rest } = data;
  const patch: Parameters<typeof updateCollectionItem>[1] = { ...rest };
  if (pd === "" || pd === null) {
    patch.purchaseDate = null;
  } else if (pd) {
    patch.purchaseDate = new Date(pd);
  }
  await updateCollectionItem(collectionItemId, patch);
  revalidatePath("/catalog", "layout");
  revalidatePath("/collection", "layout");
  revalidatePath(`/albums/${albumReferenceId}`);
  revalidatePath("/");
}
