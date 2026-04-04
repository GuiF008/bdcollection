export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import CollectionSeriesDetailClient from "@/components/collection/CollectionSeriesDetailClient";
import { getCollectionItemsWithRefs } from "@/lib/services/collectionItems.service";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ seriesId: string }> };
type SearchParams = Promise<{ dup?: string; eo?: string }>;

export default async function CollectionSeriesPage({
  params,
  searchParams,
}: {
  params: Props["params"];
  searchParams: SearchParams;
}) {
  const { seriesId } = await params;
  const sp = await searchParams;

  const series = await prisma.seriesReference.findUnique({
    where: { id: seriesId },
    select: {
      id: true,
      title: true,
      slug: true,
      source: true,
      summary: true,
      universe: true,
      coverImageUrl: true,
      authors: true,
      publisher: true,
    },
  });

  if (!series) notFound();

  const items = await getCollectionItemsWithRefs({
    seriesReferenceId: seriesId,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const hasAny = items.length > 0;

  return (
    <div>
      <PageHeader
        title={series.title}
        description={
          hasAny
            ? "Albums suivis pour cette série. Affinez possession, EO et recherche ici."
            : "Aucun album suivi pour cette série pour l’instant."
        }
      />

      {hasAny ? (
        <CollectionSeriesDetailClient
          series={series}
          items={items}
          initialDupOnly={sp.dup === "1"}
          initialEoOnly={sp.eo === "1"}
        />
      ) : (
        <p className="text-sm text-text-secondary">
          Ajoutez des tomes depuis le{" "}
          <Link href={`/catalog/${seriesId}`} className="text-primary font-medium hover:underline">
            catalogue importé
          </Link>{" "}
          (bouton « Ajouter à mon suivi »), puis confirmez le statut ici.
        </p>
      )}
    </div>
  );
}
