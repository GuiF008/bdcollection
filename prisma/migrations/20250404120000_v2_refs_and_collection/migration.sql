-- V2 : catalogue (series_references / album_references) + collection_items
-- Renommage depuis catalog_* + migration des données Series/Album si présentes.

ALTER TYPE "CatalogSource" ADD VALUE IF NOT EXISTS 'local';

CREATE TYPE "OwnershipStatus" AS ENUM ('NOT_OWNED', 'OWNED', 'WANTED', 'HUNTING', 'DUPLICATE');
CREATE TYPE "EditionStatus" AS ENUM ('UNKNOWN', 'FIRST_EDITION', 'NOT_FIRST_EDITION');
CREATE TYPE "EditionConfidence" AS ENUM ('TO_VERIFY', 'PROBABLE', 'CONFIRMED');
CREATE TYPE "ConditionGrade" AS ENUM ('UNKNOWN', 'MINT', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE "CompletenessStatus" AS ENUM ('COMPLETE', 'INCOMPLETE', 'UNKNOWN');
CREATE TYPE "SearchStatus" AS ENUM ('NONE', 'WANTED', 'HUNTING');

ALTER TABLE "catalog_series" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "catalog_series" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;

ALTER TABLE "catalog_albums" ADD COLUMN IF NOT EXISTS "knownEditionsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "catalog_albums" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "catalog_albums" ADD COLUMN IF NOT EXISTS "sourceAlbumUrl" TEXT;

ALTER TABLE "catalog_albums" DROP CONSTRAINT IF EXISTS "catalog_albums_catalogSeriesId_fkey";
ALTER TABLE "catalog_albums" DROP CONSTRAINT IF EXISTS "catalog_albums_catalogSeriesId_sourceAlbumId_key";

ALTER TABLE "catalog_series" RENAME TO "series_references";

ALTER TABLE "catalog_albums" RENAME COLUMN "catalogSeriesId" TO "seriesReferenceId";
ALTER TABLE "catalog_albums" RENAME COLUMN "sourceAlbumId" TO "externalId";
ALTER TABLE "catalog_albums" RENAME COLUMN "authorsText" TO "authors";
ALTER TABLE "catalog_albums" RENAME TO "album_references";

ALTER TABLE "series_references" RENAME CONSTRAINT "catalog_series_pkey" TO "series_references_pkey";
ALTER TABLE "album_references" RENAME CONSTRAINT "catalog_albums_pkey" TO "album_references_pkey";

ALTER TABLE "album_references" ADD CONSTRAINT "album_references_seriesReferenceId_fkey" FOREIGN KEY ("seriesReferenceId") REFERENCES "series_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "album_references" ADD CONSTRAINT "album_references_seriesReferenceId_externalId_key" UNIQUE ("seriesReferenceId", "externalId");

ALTER INDEX "catalog_series_slug_idx" RENAME TO "series_references_slug_idx";
ALTER INDEX "catalog_series_title_idx" RENAME TO "series_references_title_idx";
ALTER INDEX "catalog_series_source_sourceSeriesId_key" RENAME TO "series_references_source_sourceSeriesId_key";

DROP INDEX IF EXISTS "catalog_albums_catalogSeriesId_idx";
CREATE INDEX "album_references_seriesReferenceId_idx" ON "album_references"("seriesReferenceId");
DROP INDEX IF EXISTS "catalog_albums_isbn_idx";
CREATE INDEX "album_references_isbn_idx" ON "album_references"("isbn");

ALTER TABLE "import_jobs" DROP CONSTRAINT IF EXISTS "import_jobs_catalogSeriesId_fkey";
ALTER TABLE "import_jobs" RENAME COLUMN "catalogSeriesId" TO "seriesReferenceId";
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_seriesReferenceId_fkey" FOREIGN KEY ("seriesReferenceId") REFERENCES "series_references"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "albumReferenceId" TEXT NOT NULL,
    "ownershipStatus" "OwnershipStatus" NOT NULL DEFAULT 'NOT_OWNED',
    "searchStatus" "SearchStatus" NOT NULL DEFAULT 'NONE',
    "editionStatus" "EditionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "editionConfidence" "EditionConfidence" NOT NULL DEFAULT 'TO_VERIFY',
    "conditionGrade" "ConditionGrade" NOT NULL DEFAULT 'UNKNOWN',
    "completenessStatus" "CompletenessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "hasPersonalPhoto" BOOLEAN NOT NULL DEFAULT false,
    "personalPhotoUrl" TEXT,
    "purchasePrice" DECIMAL(12,2),
    "purchaseDate" TIMESTAMP(3),
    "purchaseSource" TEXT,
    "notes" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "collection_items_albumReferenceId_idx" ON "collection_items"("albumReferenceId");
CREATE INDEX "collection_items_ownershipStatus_idx" ON "collection_items"("ownershipStatus");

ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_albumReferenceId_fkey" FOREIGN KEY ("albumReferenceId") REFERENCES "album_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Données legacy (Album / Series) : uniquement si les tables MVP existent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Album'
  ) THEN
    EXECUTE $bede$
      INSERT INTO "collection_items" (
        "id", "albumReferenceId", "ownershipStatus", "searchStatus", "editionStatus", "editionConfidence",
        "conditionGrade", "completenessStatus", "hasPersonalPhoto", "purchasePrice", "purchaseDate", "purchaseSource",
        "notes", "isDuplicate", "quantity", "metadataJson", "createdAt", "updatedAt"
      )
      SELECT
        md5(random()::text || a.id || clock_timestamp()::text),
        ar.id,
        'OWNED'::"OwnershipStatus",
        'NONE'::"SearchStatus",
        CASE WHEN a."isOriginalEdition" THEN 'FIRST_EDITION'::"EditionStatus" ELSE 'UNKNOWN'::"EditionStatus" END,
        CASE WHEN a."isOriginalEdition" THEN 'CONFIRMED'::"EditionConfidence" ELSE 'TO_VERIFY'::"EditionConfidence" END,
        'UNKNOWN'::"ConditionGrade",
        'UNKNOWN'::"CompletenessStatus",
        false,
        NULL,
        NULL,
        NULL,
        a."personalNotes",
        false,
        1,
        jsonb_build_object(
          'ean', a.ean,
          'estimatedValue', a."estimatedValue",
          'valuationSource', a."valuationSource",
          'editionLabel', a."editionLabel",
          'legacyAlbumId', a.id
        ),
        a."createdAt",
        a."updatedAt"
      FROM "Album" a
      INNER JOIN "album_references" ar ON ar."externalId" = a."externalId"
      INNER JOIN "series_references" sr ON sr.id = ar."seriesReferenceId" AND sr.source = 'bedetheque'::"CatalogSource"
      WHERE a."externalSource" = 'bedetheque'
        AND NOT EXISTS (SELECT 1 FROM "collection_items" ci WHERE ci."albumReferenceId" = ar.id)
    $bede$;
  END IF;
END $$;

DO $$
DECLARE
  sr_id TEXT;
  ar_id TEXT;
  s RECORD;
  a RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Album'
  ) THEN
    RETURN;
  END IF;

  FOR s IN SELECT * FROM "Series"
  LOOP
    SELECT sr0.id INTO sr_id
    FROM "series_references" sr0
    WHERE sr0.source = 'local'::"CatalogSource" AND sr0."sourceSeriesId" = 'legacy-' || s.id;

    IF sr_id IS NULL THEN
      sr_id := md5(random()::text || s.id || clock_timestamp()::text);
      INSERT INTO "series_references" (
        id, source, "sourceSeriesId", "sourceUrl", title, slug, universe, summary, status, "albumCount",
        "rawPayload", "firstFetchedAt", "lastFetchedAt", "lastRefreshAt", "cacheExpiresAt", "createdAt", "updatedAt", "coverImageUrl"
      ) VALUES (
        sr_id,
        'local',
        'legacy-' || s.id,
        '',
        s.title,
        COALESCE(
          NULLIF(lower(regexp_replace(left(s.title, 80), '[^a-zA-Z0-9]+', '-', 'g')), ''),
          'legacy-' || left(s.id, 12)
        ),
        NULL,
        s.description,
        NULL,
        (SELECT COUNT(*)::int FROM "Album" a0 WHERE a0."seriesId" = s.id),
        NULL,
        NOW(), NOW(), NULL, NOW() + interval '3650 days',
        NOW(), NOW(),
        s."coverImageUrl"
      );
    END IF;

    FOR a IN SELECT * FROM "Album" WHERE "seriesId" = s.id
    LOOP
      IF EXISTS (
        SELECT 1 FROM "collection_items" ci
        WHERE ci."metadataJson"->>'legacyAlbumId' = a.id::text
      ) THEN
        CONTINUE;
      END IF;

      ar_id := md5(random()::text || a.id || clock_timestamp()::text);
      INSERT INTO "album_references" (
        id, "seriesReferenceId", "externalId", code, "volumeNumber", "volumeLabel", title, subtitle, authors, publisher,
        "publicationDate", "legalDeposit", isbn, "pageCount", format, weight, rating, "ratingCount", estimate,
        "editionLabel", "isOriginalEdition", "coverImageUrl", summary, "rawPayload", "knownEditionsCount", "sourceName", "sourceAlbumUrl",
        "createdAt", "updatedAt"
      ) VALUES (
        ar_id,
        sr_id,
        'legacy-' || a.id,
        NULL,
        a."volumeNumber",
        NULL,
        a.title,
        NULL,
        a.author,
        a.publisher,
        a."publicationDate",
        NULL,
        a.isbn,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        a."editionLabel",
        a."isOriginalEdition",
        a."coverImageUrl",
        a.summary,
        NULL,
        0,
        CASE WHEN a."externalSource" IS NOT NULL THEN a."externalSource" ELSE 'local' END,
        NULL,
        a."createdAt",
        a."updatedAt"
      );

      INSERT INTO "collection_items" (
        id, "albumReferenceId", "ownershipStatus", "searchStatus", "editionStatus", "editionConfidence",
        "conditionGrade", "completenessStatus", "hasPersonalPhoto", "purchasePrice", "purchaseDate", "purchaseSource",
        "notes", "isDuplicate", "quantity", "metadataJson", "createdAt", "updatedAt"
      ) VALUES (
        md5(random()::text || a.id || 'ci' || clock_timestamp()::text),
        ar_id,
        'OWNED'::"OwnershipStatus",
        'NONE'::"SearchStatus",
        CASE WHEN a."isOriginalEdition" THEN 'FIRST_EDITION'::"EditionStatus" ELSE 'UNKNOWN'::"EditionStatus" END,
        CASE WHEN a."isOriginalEdition" THEN 'CONFIRMED'::"EditionConfidence" ELSE 'TO_VERIFY'::"EditionConfidence" END,
        'UNKNOWN'::"ConditionGrade",
        'UNKNOWN'::"CompletenessStatus",
        false,
        NULL,
        NULL,
        NULL,
        a."personalNotes",
        false,
        1,
        jsonb_build_object(
          'ean', a.ean,
          'estimatedValue', a."estimatedValue",
          'valuationSource', a."valuationSource",
          'editionLabel', a."editionLabel",
          'legacyAlbumId', a.id
        ),
        a."createdAt",
        a."updatedAt"
      );
    END LOOP;
  END LOOP;
END $$;

DROP TABLE IF EXISTS "Album" CASCADE;
DROP TABLE IF EXISTS "Series" CASCADE;
