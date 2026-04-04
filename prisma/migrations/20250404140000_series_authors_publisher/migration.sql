-- Infos « série » (auteur / éditeur) pour l’affichage type ancienne collection
ALTER TABLE "series_references" ADD COLUMN IF NOT EXISTS "authors" TEXT;
ALTER TABLE "series_references" ADD COLUMN IF NOT EXISTS "publisher" TEXT;
