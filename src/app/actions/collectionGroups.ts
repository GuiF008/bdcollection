"use server";

import { revalidatePath } from "next/cache";
import {
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
  return { ok: true as const };
}
