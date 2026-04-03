import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.album.deleteMany();
  await prisma.series.deleteMany();

  console.log("Création des séries...");

  const tintin = await prisma.series.create({
    data: {
      title: "Tintin",
      normalizedTitle: normalize("Tintin"),
      description:
        "Les Aventures de Tintin est une série de bandes dessinées créée par le dessinateur et scénariste belge Hergé.",
      authors: "Hergé",
      publisher: "Casterman",
      personalNotes: "Collection complète en éditions récentes.",
    },
  });

  const asterix = await prisma.series.create({
    data: {
      title: "Astérix",
      normalizedTitle: normalize("Astérix"),
      description:
        "Astérix est une série de bandes dessinées franco-belge créée par René Goscinny et Albert Uderzo.",
      authors: "René Goscinny, Albert Uderzo",
      publisher: "Dargaud",
      personalNotes: "Recherche des premières éditions.",
    },
  });

  const blueberry = await prisma.series.create({
    data: {
      title: "Blueberry",
      normalizedTitle: normalize("Blueberry"),
      description:
        "Blueberry est une série de bande dessinée western créée par Jean-Michel Charlier et Jean Giraud.",
      authors: "Jean-Michel Charlier, Jean Giraud",
      publisher: "Dargaud",
    },
  });

  const blake = await prisma.series.create({
    data: {
      title: "Blake et Mortimer",
      normalizedTitle: normalize("Blake et Mortimer"),
      description:
        "Blake et Mortimer est une série de bande dessinée belge créée par Edgar P. Jacobs.",
      authors: "Edgar P. Jacobs",
      publisher: "Blake et Mortimer",
    },
  });

  const lucky = await prisma.series.create({
    data: {
      title: "Lucky Luke",
      normalizedTitle: normalize("Lucky Luke"),
      description: "Lucky Luke, le cow-boy qui tire plus vite que son ombre.",
      authors: "Morris, René Goscinny",
      publisher: "Dupuis",
    },
  });

  console.log("Création des albums...");

  const albumsData = [
    // Tintin
    {
      seriesId: tintin.id,
      title: "Tintin au pays des Soviets",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1930-01-01"),
      volumeNumber: 1,
      isOriginalEdition: false,
      summary:
        "Tintin et Milou partent en reportage au pays des Soviets et découvrent les dessous du régime bolchévique.",
    },
    {
      seriesId: tintin.id,
      title: "Tintin au Congo",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1931-01-01"),
      volumeNumber: 2,
      isOriginalEdition: false,
    },
    {
      seriesId: tintin.id,
      title: "Les Cigares du Pharaon",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1934-01-01"),
      volumeNumber: 4,
      isOriginalEdition: true,
      personalNotes: "Édition originale B1, très bon état.",
    },
    {
      seriesId: tintin.id,
      title: "Le Lotus bleu",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1936-01-01"),
      volumeNumber: 5,
      isOriginalEdition: false,
      summary: "Tintin se rend en Chine et combat un réseau de trafiquants d'opium.",
    },
    {
      seriesId: tintin.id,
      title: "L'Oreille cassée",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1937-01-01"),
      volumeNumber: 6,
      isOriginalEdition: false,
    },
    {
      seriesId: tintin.id,
      title: "On a marché sur la Lune",
      author: "Hergé",
      publisher: "Casterman",
      publicationDate: new Date("1954-01-01"),
      volumeNumber: 17,
      isOriginalEdition: true,
      personalNotes: "Première édition, dos carré, état correct.",
    },

    // Astérix
    {
      seriesId: asterix.id,
      title: "Astérix le Gaulois",
      author: "René Goscinny, Albert Uderzo",
      publisher: "Dargaud",
      publicationDate: new Date("1961-01-01"),
      volumeNumber: 1,
      isOriginalEdition: true,
      summary: "Le premier album d'Astérix, où l'on découvre le village gaulois.",
      personalNotes: "Première édition récupérée chez un brocanteur.",
    },
    {
      seriesId: asterix.id,
      title: "La Serpe d'or",
      author: "René Goscinny, Albert Uderzo",
      publisher: "Dargaud",
      publicationDate: new Date("1962-01-01"),
      volumeNumber: 2,
      isOriginalEdition: false,
    },
    {
      seriesId: asterix.id,
      title: "Astérix et Cléopâtre",
      author: "René Goscinny, Albert Uderzo",
      publisher: "Dargaud",
      publicationDate: new Date("1965-01-01"),
      volumeNumber: 6,
      isOriginalEdition: false,
      summary: "Astérix et Obélix partent en Égypte pour aider Numérobis.",
    },
    {
      seriesId: asterix.id,
      title: "Le Combat des chefs",
      author: "René Goscinny, Albert Uderzo",
      publisher: "Dargaud",
      publicationDate: new Date("1966-01-01"),
      volumeNumber: 7,
      isOriginalEdition: false,
    },

    // Blueberry
    {
      seriesId: blueberry.id,
      title: "Fort Navajo",
      author: "Jean-Michel Charlier, Jean Giraud",
      publisher: "Dargaud",
      publicationDate: new Date("1965-01-01"),
      volumeNumber: 1,
      isOriginalEdition: false,
      summary: "Le lieutenant Blueberry arrive au Fort Navajo dans un contexte tendu.",
    },
    {
      seriesId: blueberry.id,
      title: "Tonnerre à l'Ouest",
      author: "Jean-Michel Charlier, Jean Giraud",
      publisher: "Dargaud",
      publicationDate: new Date("1966-01-01"),
      volumeNumber: 2,
      isOriginalEdition: false,
    },
    {
      seriesId: blueberry.id,
      title: "L'Aigle solitaire",
      author: "Jean-Michel Charlier, Jean Giraud",
      publisher: "Dargaud",
      publicationDate: new Date("1967-01-01"),
      volumeNumber: 3,
      isOriginalEdition: true,
      personalNotes: "Trouvé en brocante, très bel état.",
    },

    // Blake et Mortimer
    {
      seriesId: blake.id,
      title: "Le Secret de l'Espadon - Tome 1",
      author: "Edgar P. Jacobs",
      publisher: "Blake et Mortimer",
      publicationDate: new Date("1950-01-01"),
      volumeNumber: 1,
      isOriginalEdition: false,
      summary: "Premier épisode des aventures de Blake et Mortimer.",
    },
    {
      seriesId: blake.id,
      title: "Le Mystère de la Grande Pyramide - Tome 1",
      author: "Edgar P. Jacobs",
      publisher: "Blake et Mortimer",
      publicationDate: new Date("1954-01-01"),
      volumeNumber: 4,
      isOriginalEdition: false,
    },
    {
      seriesId: blake.id,
      title: "La Marque Jaune",
      author: "Edgar P. Jacobs",
      publisher: "Blake et Mortimer",
      publicationDate: new Date("1956-01-01"),
      volumeNumber: 6,
      isOriginalEdition: true,
      personalNotes: "Joyau de la collection. EO en très bon état.",
      summary: "L'un des plus grands classiques de la bande dessinée belge.",
    },

    // Lucky Luke
    {
      seriesId: lucky.id,
      title: "La Mine d'or de Dick Digger",
      author: "Morris",
      publisher: "Dupuis",
      publicationDate: new Date("1949-01-01"),
      volumeNumber: 1,
      isOriginalEdition: false,
    },
    {
      seriesId: lucky.id,
      title: "Dalton City",
      author: "Morris, René Goscinny",
      publisher: "Dargaud",
      publicationDate: new Date("1969-01-01"),
      volumeNumber: 34,
      isOriginalEdition: false,
      summary: "Les Dalton s'évadent et s'emparent de Fenton Town.",
    },
  ];

  for (const data of albumsData) {
    await prisma.album.create({
      data: {
        ...data,
        normalizedTitle: normalize(data.title),
        normalizedAuthor: data.author ? normalize(data.author) : null,
        normalizedPublisher: data.publisher ? normalize(data.publisher) : null,
      },
    });
  }

  console.log(
    `Seed terminé : ${albumsData.length} albums dans ${5} séries créés.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
