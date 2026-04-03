"use server";

import { revalidatePath } from "next/cache";
import * as seriesService from "@/lib/services/series";
import { saveFile, deleteFile } from "@/lib/storage/upload";
import type { CreateSeriesInput, UpdateSeriesInput } from "@/lib/domain/types";

export async function createSeriesAction(formData: FormData) {
  const input: CreateSeriesInput = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    authors: (formData.get("authors") as string) || undefined,
    publisher: (formData.get("publisher") as string) || undefined,
    personalNotes: (formData.get("personalNotes") as string) || undefined,
  };

  const series = await seriesService.createSeries(input);

  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    const coverUrl = await saveFile(coverFile, `series-${series.id}`);
    await seriesService.updateSeries({ id: series.id, ...({} as Record<string, never>) });
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.series.update({
      where: { id: series.id },
      data: { coverImageUrl: coverUrl },
    });
  }

  revalidatePath("/");
  revalidatePath("/series");
  return { success: true, id: series.id };
}

export async function updateSeriesAction(formData: FormData) {
  const id = formData.get("id") as string;
  const input: UpdateSeriesInput = {
    id,
    title: (formData.get("title") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    authors: (formData.get("authors") as string) || undefined,
    publisher: (formData.get("publisher") as string) || undefined,
    personalNotes: (formData.get("personalNotes") as string) || undefined,
  };

  await seriesService.updateSeries(input);

  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    const existing = await seriesService.getSeriesById(id);
    if (existing?.coverImageUrl) {
      await deleteFile(existing.coverImageUrl);
    }
    const coverUrl = await saveFile(coverFile, `series-${id}`);
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.series.update({
      where: { id },
      data: { coverImageUrl: coverUrl },
    });
  }

  revalidatePath("/");
  revalidatePath("/series");
  revalidatePath(`/series/${id}`);
  return { success: true };
}

export async function deleteSeriesAction(id: string) {
  const series = await seriesService.getSeriesById(id);
  if (series?.coverImageUrl) {
    await deleteFile(series.coverImageUrl);
  }
  await seriesService.deleteSeries(id);

  revalidatePath("/");
  revalidatePath("/series");
  return { success: true };
}
