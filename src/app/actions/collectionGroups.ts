"use server";

import { revalidatePath } from "next/cache";
import {
  addSeriesToCollectionGroup,
  createCollectionGroup,
  deleteCollectionGroup,
  renameCollectionGroup,
  setSeriesCollectionGroups,
} from "@/lib/services/collectionGroups.service";

export async function createCollectionGroupAction(name: string) {
  try {
    await createCollectionGroup(name);
    revalidatePath("/collection", "layout");
    revalidatePath("/collection/groups");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function renameCollectionGroupAction(id: string, name: string) {
  try {
    await renameCollectionGroup(id, name);
    revalidatePath("/collection", "layout");
    revalidatePath("/collection/groups");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function deleteCollectionGroupAction(id: string) {
  try {
    await deleteCollectionGroup(id);
    revalidatePath("/collection", "layout");
    revalidatePath("/collection/groups");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Suppression impossible." };
  }
}

export async function setSeriesCollectionGroupsAction(seriesReferenceId: string, groupIds: string[]) {
  await setSeriesCollectionGroups(seriesReferenceId, groupIds);
  revalidatePath("/collection", "layout");
  revalidatePath(`/collection/${seriesReferenceId}`);
  revalidatePath("/collection/groups");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function addSeriesToCollectionGroupAction(
  seriesReferenceIds: string[],
  collectionGroupId: string
) {
  try {
    if (!collectionGroupId?.trim()) {
      return { ok: false as const, error: "Choisissez un groupe." };
    }
    const ids = [...new Set(seriesReferenceIds)].filter(Boolean);
    if (ids.length === 0) {
      return { ok: false as const, error: "Aucune série sélectionnée." };
    }
    const { count } = await addSeriesToCollectionGroup(ids, collectionGroupId.trim());
    revalidatePath("/collection", "layout");
    revalidatePath("/collection/groups");
    revalidatePath("/", "layout");
    for (const id of ids) {
      revalidatePath(`/collection/${id}`);
    }
    return { ok: true as const, count };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Erreur" };
  }
}
