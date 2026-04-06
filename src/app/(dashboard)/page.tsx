export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, Library, Star, Copy, AlertCircle, Layers } from "lucide-react";
import { getDashboardV2Stats } from "@/lib/services/collectionItems.service";
import { listCollectionGroupsForDashboard } from "@/lib/services/collectionGroups.service";
import KpiCard from "@/components/ui/KpiCard";
import DashboardCollectionPreviewClient from "@/components/dashboard/DashboardCollectionPreviewClient";
import DashboardGroupsSection from "@/components/dashboard/DashboardGroupsSection";
import DashboardSeriesProgressCollapsible from "@/components/dashboard/DashboardSeriesProgressCollapsible";

export default async function DashboardPage() {
  const [stats, groups] = await Promise.all([
    getDashboardV2Stats(),
    listCollectionGroupsForDashboard(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Catalogue importé et collection personnelle sont séparés : les chiffres reflètent cette distinction.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <KpiCard
          title="Séries (catalogue)"
          value={stats.seriesImported}
          icon={Library}
          color="secondary"
          href="/catalog"
          size="lg"
        />
        <KpiCard
          title="Albums référencés"
          value={stats.albumsReferenced}
          icon={Layers}
          color="primary"
          href="/catalog"
          size="lg"
        />
        <KpiCard
          title="Dans ma collection"
          value={stats.itemsInCollection}
          icon={BookOpen}
          color="success"
          href="/collection"
          size="lg"
        />
        <KpiCard
          title="EO confirmées"
          value={stats.confirmedFirstEditions}
          icon={Star}
          color="accent"
          href="/collection?eo=1"
          size="lg"
        />
        <KpiCard
          title="Manquants"
          value={stats.missingOwned}
          icon={AlertCircle}
          color="accent"
          href="/catalog"
          size="lg"
        />
        <KpiCard
          title="Doublons"
          value={stats.duplicateCount}
          icon={Copy}
          color="secondary"
          href="/collection?dup=1"
          size="lg"
        />
      </div>

      <DashboardGroupsSection groups={groups} />

      {stats.collectionSeriesPreview.length > 0 && (
        <DashboardCollectionPreviewClient
          summaries={stats.collectionSeriesPreview}
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
        />
      )}

      <DashboardSeriesProgressCollapsible series={stats.seriesProgress.slice(0, 12)} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"
        >
          Parcourir le catalogue
        </Link>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary"
        >
          Ma collection
        </Link>
        <Link
          href="/import-export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary"
        >
          Import / Export
        </Link>
      </div>
    </div>
  );
}
