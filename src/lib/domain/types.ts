import type { AlbumReference, CollectionItem, SeriesReference } from "@/generated/prisma/client";

/** Item de collection avec fiche album et série (forme renvoyée par les services). */
export type CollectionItemWithRef = CollectionItem & {
  albumReference: AlbumReference & {
    seriesReference: Pick<SeriesReference, "id" | "title" | "slug" | "source">;
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
