export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CollectionSeriesHubClient from "@/components/collection/CollectionSeriesHubClient";
import { getCollectionSeriesSummaries } from "@/lib/services/collectionItems.service";

type SearchParams = Promise<{ dup?: string; eo?: string }>;

export default async function CollectionPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const summaries = await getCollectionSeriesSummaries();

  return (
    <div>
      {sp.eo === "1" && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-text-secondary">
          Filtre <strong className="text-text-primary">EO</strong> : ouvrez une série, puis cochez « Première
          édition » dans les filtres.
        </div>
      )}
      {sp.dup === "1" && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-text-secondary">
          Filtre <strong className="text-text-primary">Doublons</strong> : ouvrez une série, puis activez le
          filtre « Doublons ».
        </div>
      )}
      <PageHeader
        title="Ma collection"
        description="Par série : ouvrez une série pour lister les albums suivis et les actions groupées. Le statut détaillé se règle ici après ajout depuis le catalogue."
        actions={
          <Link
            href="/import-export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
          >
            Importer (CSV / JSON)
          </Link>
        }
      />

      {summaries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Collection vide"
          description="Ajoutez des albums depuis le catalogue importé (suivi), ou importez un fichier CSV / JSON."
          actionLabel="Voir le catalogue"
          actionHref="/catalog"
        />
      ) : (
        <CollectionSeriesHubClient summaries={summaries} />
      )}
    </div>
  );
}
