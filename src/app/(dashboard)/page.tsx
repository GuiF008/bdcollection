export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  BookOpen,
  Library,
  Star,
  Target,
  Copy,
  AlertCircle,
  Layers,
} from "lucide-react";
import { getDashboardV2Stats } from "@/lib/services/collectionItems.service";
import KpiCard from "@/components/ui/KpiCard";
import CoverImage from "@/components/ui/CoverImage";

export default async function DashboardPage() {
  const stats = await getDashboardV2Stats();

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

      {stats.collectionSeriesPreview.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-success" />
              Ma collection · séries suivies
            </h2>
            <Link href="/collection" className="text-sm text-primary hover:underline font-medium">
              Tout voir
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.collectionSeriesPreview.map((s) => (
              <Link
                key={s.id}
                href={`/collection/${s.id}`}
                className="flex gap-4 rounded-xl border border-border bg-white p-4 hover:border-primary/35 hover:shadow-md transition-all"
              >
                <CoverImage src={s.coverImageUrl} alt={s.title} size="lg" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary line-clamp-2">{s.title}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {s.itemCount} suivi{s.itemCount > 1 ? "s" : ""}
                    {s.ownedCount > 0 && (
                      <>
                        {" "}
                        · <span className="text-success font-medium">{s.ownedCount}</span> possédé
                        {s.ownedCount > 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border mb-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Progression par série (catalogue)
          </h2>
          <Link href="/catalog" className="text-sm text-primary hover:underline font-medium">
            Catalogue
          </Link>
        </div>
        {stats.seriesProgress.length === 0 ? (
          <div className="p-10 text-center text-text-muted text-sm">
            Importez une série pour commencer le suivi.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {stats.seriesProgress.slice(0, 12).map((s) => {
              const pct = s.totalRefs > 0 ? Math.round((s.owned / s.totalRefs) * 100) : 0;
              return (
                <li key={s.id}>
                  <Link
                    href={`/catalog/${s.id}`}
                    className="flex items-center gap-5 px-6 py-5 hover:bg-surface-alt/40 transition-colors"
                  >
                    <CoverImage src={s.coverImageUrl} alt={s.title} size="md" className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-text-primary truncate">{s.title}</p>
                      <p className="text-sm text-text-muted mt-1">
                        Possédés {s.owned} / {s.totalRefs} · EO confirmées {s.confirmedEo} · Manquants{" "}
                        {s.missing}
                      </p>
                      <div className="mt-3 h-2 rounded-full bg-surface-alt overflow-hidden max-w-xl">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary shrink-0 tabular-nums">{pct}%</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
