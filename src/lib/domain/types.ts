export interface SeriesWithCount {
  id: string;
  title: string;
  normalizedTitle: string;
  description: string | null;
  authors: string | null;
  publisher: string | null;
  coverImageUrl: string | null;
  personalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    albums: number;
  };
}

export interface AlbumWithSeries {
  id: string;
  seriesId: string;
  title: string;
  normalizedTitle: string;
  author: string | null;
  normalizedAuthor: string | null;
  publisher: string | null;
  normalizedPublisher: string | null;
  publicationDate: Date | null;
  volumeNumber: number | null;
  summary: string | null;
  coverImageUrl: string | null;
  isOriginalEdition: boolean;
  personalNotes: string | null;
  externalSource: string | null;
  externalId: string | null;
  isbn: string | null;
  ean: string | null;
  editionLabel: string | null;
  estimatedValue: number | null;
  valuationSource: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  series: {
    id: string;
    title: string;
  };
}

/** Séries affichées sur le dashboard (vignette + titre). */
export interface DashboardSeriesPreview {
  id: string;
  title: string;
  coverImageUrl: string | null;
}

export interface DashboardStats {
  totalAlbums: number;
  totalSeries: number;
  originalEditions: number;
  recentAlbums: AlbumWithSeries[];
  publisherDistribution: { publisher: string; count: number }[];
  authorDistribution: { author: string; count: number }[];
  seriesPreview: DashboardSeriesPreview[];
}

export interface SearchResult {
  albums: AlbumWithSeries[];
  series: SeriesWithCount[];
}

export type SortField =
  | "title"
  | "author"
  | "publisher"
  | "publicationDate"
  | "createdAt"
  | "volumeNumber"
  | "isOriginalEdition";

export type SortOrder = "asc" | "desc";

export interface AlbumFilters {
  search?: string;
  seriesId?: string;
  author?: string;
  publisher?: string;
  isOriginalEdition?: boolean;
  hasCover?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export interface SeriesFilters {
  search?: string;
  publisher?: string;
  sortField?: "title" | "createdAt" | "updatedAt";
  sortOrder?: SortOrder;
}

export interface CreateSeriesInput {
  title: string;
  description?: string;
  authors?: string;
  publisher?: string;
  personalNotes?: string;
}

export interface UpdateSeriesInput extends Partial<CreateSeriesInput> {
  id: string;
}

export interface CreateAlbumInput {
  seriesId: string;
  title: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  volumeNumber?: number;
  summary?: string;
  isOriginalEdition?: boolean;
  personalNotes?: string;
  isbn?: string;
  ean?: string;
}

export interface UpdateAlbumInput extends Partial<Omit<CreateAlbumInput, "seriesId">> {
  id: string;
  seriesId?: string;
}

/** Corps attendu par POST /api/import (JSON ou lignes issues d’un CSV parsé). */
export interface ImportAlbumInput {
  serie: string;
  titre: string;
  auteur?: string;
  editeur?: string;
  dateParution?: string;
  tome?: number;
  resume?: string;
  editionOriginale?: boolean;
  notesPerso?: string;
  isbn?: string;
  ean?: string;
}
