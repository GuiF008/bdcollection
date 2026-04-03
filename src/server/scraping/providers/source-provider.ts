import type { NormalizedAlbum } from "../schemas/normalized-album.schema";
import type { NormalizedSeries } from "../schemas/normalized-series.schema";

export type SeriesFetchResult = {
  series: NormalizedSeries;
  albums: NormalizedAlbum[];
  /** URLs HTML réellement chargées (pagination). */
  fetchedUrls: string[];
  warnings: string[];
};

export interface SourceProvider {
  readonly id: "bedetheque";

  supportsUrl(url: string): boolean;

  /** Récupère et parse une page série (inclut pagination séquentielle si besoin). */
  fetchSeries(url: string): Promise<SeriesFetchResult>;
}
