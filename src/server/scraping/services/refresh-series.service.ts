import { prisma } from "@/lib/db/prisma";
import { CatalogSource } from "@/generated/prisma/enums";
import { runCatalogImport } from "./import-series.service";

/**
 * Relit l’URL source stockée pour une entrée catalogue existante.
 */
export async function refreshCatalogSeries(catalogSeriesId: string) {
  const row = await prisma.catalogSeries.findUnique({
    where: { id: catalogSeriesId },
  });
  if (!row) {
    throw new Error("Série catalogue introuvable");
  }

  return runCatalogImport({
    source: row.source as CatalogSource,
    url: row.sourceUrl,
  });
}
