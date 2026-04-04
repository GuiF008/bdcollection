import type { Prisma } from "@/generated/prisma/client";
import { CatalogSource } from "@/generated/prisma/enums";
import type { NormalizedAlbum } from "../schemas/normalized-album.schema";
import type { NormalizedSeries } from "../schemas/normalized-series.schema";
import { cacheExpiresFromFetchedAt } from "../utils/dates";

function parseVolumeFields(tome: string | null): { volumeNumber: number | null; volumeLabel: string | null } {
  if (!tome) return { volumeNumber: null, volumeLabel: null };
  const trimmed = tome.trim();
  if (/^\d+$/.test(trimmed)) {
    return { volumeNumber: parseInt(trimmed, 10), volumeLabel: null };
  }
  return { volumeNumber: null, volumeLabel: trimmed };
}

function parsePublicationDate(s: string | null): Date | null {
  if (!s) return null;
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(s);
  if (iso) {
    const d = new Date(iso[0]);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const mY = /^(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (mY) {
    const month = parseInt(mY[1], 10);
    const year = parseInt(mY[2], 10);
    if (month >= 1 && month <= 12) return new Date(Date.UTC(year, month - 1, 1));
  }
  return null;
}

export function toSeriesReferenceCreate(
  series: NormalizedSeries,
  now: Date,
  albumCount: number
): Prisma.SeriesReferenceCreateInput {
  if (!series.sourceSeriesId || !series.titre || !series.slug) {
    throw new Error("Série normalisée incomplète (id, titre ou slug manquant)");
  }

  return {
    source: CatalogSource.bedetheque,
    sourceSeriesId: series.sourceSeriesId,
    sourceUrl: series.sourceUrl,
    title: series.titre,
    slug: series.slug,
    universe: series.univers,
    summary: series.resume,
    status: series.statutParution,
    albumCount,
    rawPayload: series.raw === undefined ? undefined : (series.raw as Prisma.InputJsonValue),
    firstFetchedAt: now,
    lastFetchedAt: now,
    lastRefreshAt: null,
    cacheExpiresAt: cacheExpiresFromFetchedAt(now),
    sourceName: "bedetheque",
  };
}

export function toSeriesReferenceUpdate(
  series: NormalizedSeries,
  now: Date,
  albumCount: number
): Prisma.SeriesReferenceUpdateInput {
  return {
    sourceUrl: series.sourceUrl,
    title: series.titre ?? undefined,
    slug: series.slug ?? undefined,
    universe: series.univers,
    summary: series.resume,
    status: series.statutParution,
    albumCount,
    rawPayload: series.raw === undefined ? undefined : (series.raw as Prisma.InputJsonValue),
    lastFetchedAt: now,
    lastRefreshAt: now,
    cacheExpiresAt: cacheExpiresFromFetchedAt(now),
    sourceName: "bedetheque",
  };
}

function legalDepositFromRaw(raw: unknown): string | null {
  const labels = (raw as { labels?: Record<string, string> })?.labels;
  if (!labels) return null;
  return labels["Dépot légal"] ?? labels["Dépôt légal"] ?? null;
}

export function toAlbumReferenceUpsert(
  seriesReferenceId: string,
  album: NormalizedAlbum,
  now: Date
): { create: Prisma.AlbumReferenceCreateInput; update: Prisma.AlbumReferenceUpdateInput } {
  if (!album.sourceAlbumId) {
    throw new Error("Album sans sourceAlbumId");
  }
  const { volumeNumber, volumeLabel } = parseVolumeFields(album.tome);
  const legalDeposit = legalDepositFromRaw(album.raw);

  const base = {
    externalId: album.sourceAlbumId,
    code: album.code,
    volumeNumber,
    volumeLabel,
    title: album.titre ?? "Sans titre",
    subtitle: null as string | null,
    authors: album.auteur,
    publisher: album.editeur,
    publicationDate: parsePublicationDate(album.dateParution),
    legalDeposit,
    isbn: album.isbn,
    pageCount: album.pages,
    format: album.format,
    weight: album.poids,
    rating: album.note,
    ratingCount: album.nbVotes,
    estimate: album.cote,
    editionLabel: album.editionLabel,
    isOriginalEdition: album.editionOriginale,
    coverImageUrl: album.coverImageUrl,
    summary: album.resume,
    rawPayload: album.raw === undefined ? undefined : (album.raw as Prisma.InputJsonValue),
    sourceName: "bedetheque",
    knownEditionsCount: 0,
  };

  return {
    create: {
      ...base,
      seriesReference: { connect: { id: seriesReferenceId } },
    },
    update: {
      ...base,
      updatedAt: now,
    },
  };
}
