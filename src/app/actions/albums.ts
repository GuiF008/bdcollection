"use server";

import { revalidatePath } from "next/cache";
import * as albumsService from "@/lib/services/albums";
import { saveFile, deleteFile } from "@/lib/storage/upload";
import type { CreateAlbumInput, UpdateAlbumInput } from "@/lib/domain/types";

export async function createAlbumAction(formData: FormData) {
  const input: CreateAlbumInput = {
    seriesId: formData.get("seriesId") as string,
    title: formData.get("title") as string,
    author: (formData.get("author") as string) || undefined,
    publisher: (formData.get("publisher") as string) || undefined,
    publicationDate: (formData.get("publicationDate") as string) || undefined,
    volumeNumber: formData.get("volumeNumber")
      ? parseInt(formData.get("volumeNumber") as string, 10)
      : undefined,
    summary: (formData.get("summary") as string) || undefined,
    isOriginalEdition: formData.get("isOriginalEdition") === "true",
    personalNotes: (formData.get("personalNotes") as string) || undefined,
    isbn: (formData.get("isbn") as string) || undefined,
    ean: (formData.get("ean") as string) || undefined,
  };

  const album = await albumsService.createAlbum(input);

  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    const coverUrl = await saveFile(coverFile, `album-${album.id}`);
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.album.update({
      where: { id: album.id },
      data: { coverImageUrl: coverUrl },
    });
  }

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath(`/series/${input.seriesId}`);
  return { success: true, id: album.id };
}

export async function updateAlbumAction(formData: FormData) {
  const id = formData.get("id") as string;
  const input: UpdateAlbumInput = {
    id,
    seriesId: (formData.get("seriesId") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    author: (formData.get("author") as string) || undefined,
    publisher: (formData.get("publisher") as string) || undefined,
    publicationDate: (formData.get("publicationDate") as string) || undefined,
    volumeNumber: formData.get("volumeNumber")
      ? parseInt(formData.get("volumeNumber") as string, 10)
      : undefined,
    summary: (formData.get("summary") as string) || undefined,
    isOriginalEdition: formData.get("isOriginalEdition") === "true",
    personalNotes: (formData.get("personalNotes") as string) || undefined,
    isbn: (formData.get("isbn") as string) || undefined,
    ean: (formData.get("ean") as string) || undefined,
  };

  await albumsService.updateAlbum(input);

  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    const existing = await albumsService.getAlbumById(id);
    if (existing?.coverImageUrl) {
      await deleteFile(existing.coverImageUrl);
    }
    const coverUrl = await saveFile(coverFile, `album-${id}`);
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.album.update({
      where: { id },
      data: { coverImageUrl: coverUrl },
    });
  }

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath(`/albums/${id}`);
  return { success: true };
}

export async function deleteAlbumAction(id: string) {
  const album = await albumsService.getAlbumById(id);
  if (album?.coverImageUrl) {
    await deleteFile(album.coverImageUrl);
  }
  await albumsService.deleteAlbum(id);

  revalidatePath("/");
  revalidatePath("/albums");
  if (album) {
    revalidatePath(`/series/${album.seriesId}`);
  }
  return { success: true };
}
