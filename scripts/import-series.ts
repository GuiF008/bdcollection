/**
 * Usage : npm run import:series -- "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html"
 */
import "dotenv/config";
import { CatalogSource } from "../src/generated/prisma/enums";
import { runCatalogImport } from "../src/server/scraping/services/import-series.service";

async function main() {
  const url = process.argv.slice(2).find((a) => a.startsWith("http"));
  if (!url) {
    console.error('Usage: npm run import:series -- "<url série bedetheque>"');
    process.exit(1);
  }

  const result = await runCatalogImport({ source: CatalogSource.bedetheque, url });
  console.log(JSON.stringify(result, null, 2));
  if (result.status === "failed") {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
