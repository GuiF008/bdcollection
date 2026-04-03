import { z } from "zod";

export const normalizedSeriesSchema = z.object({
  source: z.literal("bedetheque"),
  sourceSeriesId: z.string().nullable(),
  sourceUrl: z.string(),
  titre: z.string().nullable(),
  slug: z.string().nullable(),
  univers: z.string().nullable(),
  resume: z.string().nullable(),
  statutParution: z.string().nullable(),
  nombreAlbumsSite: z.number().int().nullable(),
  raw: z.unknown(),
});

export type NormalizedSeries = z.infer<typeof normalizedSeriesSchema>;
