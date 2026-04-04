import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import {
  CatalogSource,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "../src/generated/prisma/enums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const FAR = () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10);

async function main() {
  console.log("Nettoyage seed V2…");
  await prisma.collectionItem.deleteMany();
  await prisma.albumReference.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.seriesReference.deleteMany();

  const now = new Date();

  const sr = await prisma.seriesReference.create({
    data: {
      source: CatalogSource.local,
      sourceSeriesId: "seed-demo-tintin",
      sourceUrl: "",
      title: "Tintin (démo locale)",
      slug: "tintin-demo",
      summary: "Jeu de données de démonstration — catalogue + collection.",
      albumCount: 2,
      firstFetchedAt: now,
      lastFetchedAt: now,
      cacheExpiresAt: FAR(),
      sourceName: "seed",
    },
  });

  const a1 = await prisma.albumReference.create({
    data: {
      seriesReferenceId: sr.id,
      externalId: "seed-album-1",
      title: "Le Crabe aux pinces d’or",
      volumeNumber: 9,
      authors: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1941-01-01"),
      summary: "Tintin et le capitaine Haddock poursuivent des trafiquants d’opium.",
      sourceName: "seed",
    },
  });

  const a2 = await prisma.albumReference.create({
    data: {
      seriesReferenceId: sr.id,
      externalId: "seed-album-2",
      title: "Tintin au Tibet",
      volumeNumber: 20,
      authors: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1960-01-01"),
      sourceName: "seed",
    },
  });

  await prisma.collectionItem.create({
    data: {
      albumReferenceId: a1.id,
      ownershipStatus: OwnershipStatus.OWNED,
      editionStatus: EditionStatus.FIRST_EDITION,
      editionConfidence: EditionConfidence.PROBABLE,
      notes: "Exemplaire de démo — à compléter.",
    },
  });

  await prisma.collectionItem.create({
    data: {
      albumReferenceId: a2.id,
      ownershipStatus: OwnershipStatus.WANTED,
      searchStatus: SearchStatus.WANTED,
    },
  });

  await prisma.seriesReference.update({
    where: { id: sr.id },
    data: { albumCount: 2 },
  });

  console.log("Seed V2 terminé : 1 série locale, 2 albums réf., 2 fiches collection.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
