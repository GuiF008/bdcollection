export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CollectionListClient from "@/components/collection/CollectionListClient";
import { getCollectionItemsWithRefs } from "@/lib/services/collectionItems.service";
import { prisma } from "@/lib/db/prisma";

type SearchParams = Promise<{ dup?: string; eo?: string }>;

export default async function CollectionPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [items, seriesOptions] = await Promise.all([
    getCollectionItemsWithRefs({
      sortField: "createdAt",
      sortOrder: "desc",
    }),
    prisma.seriesReference.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Ma collection"
        description="Regroupée par série : résumé et métadonnées de la série, puis vos albums. Cochez plusieurs tomes pour une action groupée."
        actions={
          <Link
            href="/import-export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
          >
            Importer (CSV / JSON)
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Collection vide"
          description="Ajoutez des albums depuis le catalogue importé, ou importez un fichier CSV / JSON."
          actionLabel="Voir le catalogue"
          actionHref="/catalog"
        />
      ) : (
        <CollectionListClient
          items={items}
          seriesOptions={seriesOptions}
          initialDupOnly={sp.dup === "1"}
          initialEoOnly={sp.eo === "1"}
        />
      )}
    </div>
  );
}
