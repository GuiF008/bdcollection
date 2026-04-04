"use server";

import { revalidatePath } from "next/cache";
import {
  markAlbumWanted,
  markHunting,
  upsertCollectionItemOwned,
} from "@/lib/services/collectionItems.service";
import {
  updateAlbumReferenceById,
  updateSeriesReferenceById,
  type UpdateAlbumReferenceInput,
  type UpdateSeriesReferenceInput,
} from "@/lib/services/referenceEdits.service";

export async function updateAlbumReferenceAction(albumReferenceId: string, raw: FormData) {
  const publicationDateRaw = (raw.get("publicationDate") as string)?.trim();
  const volumeRaw = (raw.get("volumeNumber") as string)?.trim();
  let volumeNumber: number | null = null;
  if (volumeRaw) {
    const n = parseInt(volumeRaw, 10);
    volumeNumber = Number.isNaN(n) ? null : n;
  }

  const data: UpdateAlbumReferenceInput = {
    title: (raw.get("title") as string)?.trim() || undefined,
    subtitle: ((raw.get("subtitle") as string) || "").trim() || null,
    authors: ((raw.get("authors") as string) || "").trim() || null,
    publisher: ((raw.get("publisher") as string) || "").trim() || null,
    publicationDate: publicationDateRaw ? new Date(publicationDateRaw) : null,
    volumeNumber,
    volumeLabel: ((raw.get("volumeLabel") as string) || "").trim() || null,
    isbn: ((raw.get("isbn") as string) || "").trim() || null,
    summary: ((raw.get("summary") as string) || "").trim() || null,
    coverImageUrl: ((raw.get("coverImageUrl") as string) || "").trim() || null,
    editionLabel: ((raw.get("editionLabel") as string) || "").trim() || null,
  };

  if (!data.title) {
    return { ok: false as const, error: "Le titre est requis." };
  }

  await updateAlbumReferenceById(albumReferenceId, data);
  revalidatePath("/collection");
  revalidatePath(`/albums/${albumReferenceId}`);
  revalidatePath("/catalog");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateSeriesReferenceAction(seriesReferenceId: string, raw: FormData) {
  const data: UpdateSeriesReferenceInput = {
    title: (raw.get("title") as string)?.trim() || undefined,
    summary: ((raw.get("summary") as string) || "").trim() || null,
    universe: ((raw.get("universe") as string) || "").trim() || null,
    authors: ((raw.get("authors") as string) || "").trim() || null,
    publisher: ((raw.get("publisher") as string) || "").trim() || null,
    coverImageUrl: ((raw.get("coverImageUrl") as string) || "").trim() || null,
  };

  if (!data.title) {
    return { ok: false as const, error: "Le titre est requis." };
  }

  await updateSeriesReferenceById(seriesReferenceId, data);
  revalidatePath("/collection");
  revalidatePath(`/catalog/${seriesReferenceId}`);
  revalidatePath("/catalog");
  revalidatePath("/");
  return { ok: true as const };
}

export type BulkCollectionMode = "owned" | "wanted" | "hunting";

export async function bulkCollectionStatusAction(
  albumReferenceIds: string[],
  mode: BulkCollectionMode
) {
  const ids = [...new Set(albumReferenceIds)].filter(Boolean);
  if (ids.length === 0) {
    return { ok: false as const, error: "Aucun album sélectionné." };
  }

  for (const id of ids) {
    if (mode === "owned") {
      await upsertCollectionItemOwned(id);
    } else if (mode === "wanted") {
      await markAlbumWanted(id);
    } else {
      await markHunting(id);
    }
  }

  revalidatePath("/collection");
  revalidatePath("/catalog");
  revalidatePath("/");
  return { ok: true as const, count: ids.length };
}
