export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import CollectionSeriesDetailClient from "@/components/collection/CollectionSeriesDetailClient";
import SeriesGroupsPicker from "@/components/collection/SeriesGroupsPicker";
import { getCollectionItemsWithRefs } from "@/lib/services/collectionItems.service";
import { listCollectionGroups, getSeriesGroupIds } from "@/lib/services/collectionGroups.service";
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

  const [items, groups, seriesGroupIds] = await Promise.all([
    getCollectionItemsWithRefs({
      seriesReferenceId: seriesId,
      sortField: "createdAt",
      sortOrder: "desc",
    }),
    listCollectionGroups(),
    getSeriesGroupIds(seriesId),
  ]);

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

      <section className="rounded-xl border border-border bg-white p-4 sm:p-5 mb-6">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Groupes de collection</h2>
        <p className="text-xs text-text-muted mb-3">
          Cochez les regroupements auxquels appartient cette série (filtre sur la page Ma collection).
        </p>
        <SeriesGroupsPicker
          seriesReferenceId={series.id}
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          selectedIds={seriesGroupIds}
        />
      </section>

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
