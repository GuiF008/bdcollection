-- AlterEnum
ALTER TYPE "EditionStatus" ADD VALUE 'SECOND_EDITION';
ALTER TYPE "EditionStatus" ADD VALUE 'THIRD_EDITION';

-- CreateTable
CREATE TABLE "collection_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_group_memberships" (
    "seriesReferenceId" TEXT NOT NULL,
    "collectionGroupId" TEXT NOT NULL,

    CONSTRAINT "series_group_memberships_pkey" PRIMARY KEY ("seriesReferenceId","collectionGroupId")
);

-- CreateIndex
CREATE INDEX "series_group_memberships_collectionGroupId_idx" ON "series_group_memberships"("collectionGroupId");

-- AddForeignKey
ALTER TABLE "series_group_memberships" ADD CONSTRAINT "series_group_memberships_seriesReferenceId_fkey" FOREIGN KEY ("seriesReferenceId") REFERENCES "series_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "series_group_memberships" ADD CONSTRAINT "series_group_memberships_collectionGroupId_fkey" FOREIGN KEY ("collectionGroupId") REFERENCES "collection_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
