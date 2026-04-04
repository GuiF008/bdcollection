import { prisma } from "@/lib/db/prisma";
import { CatalogSource } from "@/generated/prisma/enums";
import { runCatalogImport } from "./import-series.service";

/** Relit l’URL source stockée pour une entrée catalogue existante. */
export async function refreshSeriesReference(seriesReferenceId: string) {
  const row = await prisma.seriesReference.findUnique({
    where: { id: seriesReferenceId },
  });
  if (!row) {
    throw new Error("Série catalogue introuvable");
  }

  return runCatalogImport({
    source: row.source as CatalogSource,
    url: row.sourceUrl,
  });
}
