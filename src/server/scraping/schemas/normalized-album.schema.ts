import { z } from "zod";

export const normalizedAlbumSchema = z.object({
  source: z.literal("bedetheque"),
  sourceSeriesId: z.string().nullable(),
  sourceAlbumId: z.string().nullable(),
  sourceUrl: z.string(),
  serie: z.string().nullable(),
  titre: z.string().nullable(),
  auteur: z.string().nullable(),
  editeur: z.string().nullable(),
  dateParution: z.string().nullable(),
  tome: z.string().nullable(),
  resume: z.string().nullable(),
  isbn: z.string().nullable(),
  code: z.string().nullable(),
  pages: z.number().nullable(),
  note: z.number().nullable(),
  nbVotes: z.number().nullable(),
  format: z.string().nullable(),
  poids: z.string().nullable(),
  cote: z.string().nullable(),
  editionOriginale: z.boolean().nullable(),
  editionLabel: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  raw: z.unknown(),
});

export type NormalizedAlbum = z.infer<typeof normalizedAlbumSchema>;
