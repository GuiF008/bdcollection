import { loadHtml } from "../utils/html";
import { fetchHtml } from "../utils/http-client";
import { scrapeLog } from "../utils/logger";
import { parseAlbumsFromListe } from "../parsers/bedetheque-album.parser";
import {
  extractSourceSeriesIdFromSerieUrl,
  isBedethequeSerieUrl,
  parseSeriesMeta,
  planSerieAlbumPageUrls,
} from "../parsers/bedetheque-series.parser";
import { normalizedAlbumSchema } from "../schemas/normalized-album.schema";
import { normalizedSeriesSchema } from "../schemas/normalized-series.schema";
import type { SeriesFetchResult, SourceProvider } from "./source-provider";

const BETWEEN_PAGES_MS = 450;

export class BedethequeProvider implements SourceProvider {
  readonly id = "bedetheque" as const;

  supportsUrl(url: string): boolean {
    return isBedethequeSerieUrl(url);
  }

  async fetchSeries(url: string): Promise<SeriesFetchResult> {
    const warnings: string[] = [];
    const fetchedUrls: string[] = [];

    const first = await fetchHtml(url);
    if (!first.ok) {
      throw new Error(`Téléchargement série: ${first.error}`);
    }

    const $first = loadHtml(first.html);
    const series = normalizedSeriesSchema.parse(parseSeriesMeta($first, first.finalUrl));
    const pageUrls = planSerieAlbumPageUrls($first, first.finalUrl);

    scrapeLog.info("pages album planifiées", { count: pageUrls.length, pages: pageUrls });

    const byAlbumId = new Map<string, ReturnType<typeof normalizedAlbumSchema.parse>>();

    for (let i = 0; i < pageUrls.length; i++) {
      const pageUrl = pageUrls[i];
      let html: string;
      let finalUrl: string;

      const useCachedFirst = i === 0 && pageUrl === first.finalUrl;
      if (useCachedFirst) {
        html = first.html;
        finalUrl = first.finalUrl;
        fetchedUrls.push(finalUrl);
      } else {
        if (fetchedUrls.length > 0) await sleep(BETWEEN_PAGES_MS);
        const res = await fetchHtml(pageUrl);
        if (!res.ok) {
          warnings.push(`Page ${pageUrl}: ${res.error}`);
          continue;
        }
        html = res.html;
        finalUrl = res.finalUrl;
        fetchedUrls.push(finalUrl);
      }

      const $page = loadHtml(html);
      const meta = parseSeriesMeta($page, finalUrl);
      if (meta.sourceSeriesId && series.sourceSeriesId && meta.sourceSeriesId !== series.sourceSeriesId) {
        warnings.push(`Identifiant série différent sur ${finalUrl}, ignoré`);
      }

      const { albums, errors } = parseAlbumsFromListe(
        $page,
        finalUrl,
        series.titre,
        series.sourceSeriesId ?? extractSourceSeriesIdFromSerieUrl(url)
      );

      for (const err of errors) warnings.push(err);

      for (const raw of albums) {
        const parsed = normalizedAlbumSchema.safeParse(raw);
        if (!parsed.success) {
          warnings.push(`Album invalide Zod: ${parsed.error.message}`);
          continue;
        }
        const a = parsed.data;
        const key = a.sourceAlbumId ?? a.sourceUrl;
        if (!byAlbumId.has(key)) {
          byAlbumId.set(key, a);
        }
      }
    }

    const albums = [...byAlbumId.values()];

    if (albums.length === 0) {
      warnings.push("Aucun album extrait (HTML modifié ou page sans liste ?)");
    }

    return {
      series,
      albums,
      fetchedUrls: [...new Set(fetchedUrls)],
      warnings,
    };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
