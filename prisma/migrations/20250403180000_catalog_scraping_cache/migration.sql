-- CreateEnum
CREATE TYPE "CatalogSource" AS ENUM ('bedetheque');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('pending', 'running', 'success', 'partial_success', 'failed');

-- CreateTable
CREATE TABLE "catalog_series" (
    "id" TEXT NOT NULL,
    "source" "CatalogSource" NOT NULL,
    "sourceSeriesId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "universe" TEXT,
    "summary" TEXT,
    "status" TEXT,
    "albumCount" INTEGER NOT NULL DEFAULT 0,
    "rawPayload" JSONB,
    "firstFetchedAt" TIMESTAMP(3) NOT NULL,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL,
    "lastRefreshAt" TIMESTAMP(3),
    "cacheExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_albums" (
    "id" TEXT NOT NULL,
    "catalogSeriesId" TEXT NOT NULL,
    "sourceAlbumId" TEXT NOT NULL,
    "code" TEXT,
    "volumeNumber" INTEGER,
    "volumeLabel" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "authorsText" TEXT,
    "publisher" TEXT,
    "publicationDate" TIMESTAMP(3),
    "legalDeposit" TEXT,
    "isbn" TEXT,
    "pageCount" INTEGER,
    "format" TEXT,
    "weight" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "estimate" TEXT,
    "editionLabel" TEXT,
    "isOriginalEdition" BOOLEAN,
    "coverImageUrl" TEXT,
    "summary" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "source" "CatalogSource" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "catalogSeriesId" TEXT,
    "logs" TEXT NOT NULL DEFAULT '',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_series_source_sourceSeriesId_key" ON "catalog_series"("source", "sourceSeriesId");

-- CreateIndex
CREATE INDEX "catalog_series_slug_idx" ON "catalog_series"("slug");

-- CreateIndex
CREATE INDEX "catalog_series_title_idx" ON "catalog_series"("title");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_albums_catalogSeriesId_sourceAlbumId_key" ON "catalog_albums"("catalogSeriesId", "sourceAlbumId");

-- CreateIndex
CREATE INDEX "catalog_albums_catalogSeriesId_idx" ON "catalog_albums"("catalogSeriesId");

-- CreateIndex
CREATE INDEX "catalog_albums_isbn_idx" ON "catalog_albums"("isbn");

-- CreateIndex
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");

-- CreateIndex
CREATE INDEX "import_jobs_sourceUrl_idx" ON "import_jobs"("sourceUrl");

-- CreateIndex
CREATE INDEX "import_jobs_createdAt_idx" ON "import_jobs"("createdAt");

-- AddForeignKey
ALTER TABLE "catalog_albums" ADD CONSTRAINT "catalog_albums_catalogSeriesId_fkey" FOREIGN KEY ("catalogSeriesId") REFERENCES "catalog_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_catalogSeriesId_fkey" FOREIGN KEY ("catalogSeriesId") REFERENCES "catalog_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
