import type { AlbumReference, CollectionItem, SeriesReference } from "@/generated/prisma/client";

/** Série telle que chargée pour la page collection (regroupement + en-tête). */
export type SeriesRefForCollection = Pick<
  SeriesReference,
  | "id"
  | "title"
  | "slug"
  | "source"
  | "summary"
  | "universe"
  | "coverImageUrl"
  | "authors"
  | "publisher"
>;

/** Item de collection avec fiche album et série (forme renvoyée par les services). */
export type CollectionItemWithRef = CollectionItem & {
  albumReference: AlbumReference & {
    seriesReference: SeriesRefForCollection;
  };
};

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
