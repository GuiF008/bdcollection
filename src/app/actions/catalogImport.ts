"use server";

import { revalidatePath } from "next/cache";
import {
  importCatalogSeriesToCollection,
  type ImportCatalogMode,
} from "@/lib/services/catalogToCollection";

export async function importCatalogToCollectionAction(input: {
  catalogSeriesId: string;
  mode: ImportCatalogMode;
  collectionSeriesId?: string | null;
}) {
  const result = await importCatalogSeriesToCollection({
    catalogSeriesId: input.catalogSeriesId,
    mode: input.mode,
    collectionSeriesId: input.collectionSeriesId ?? undefined,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/");
  revalidatePath("/series");
  revalidatePath("/albums");
  revalidatePath(`/series/${result.collectionSeriesId}`);

  return result;
}
