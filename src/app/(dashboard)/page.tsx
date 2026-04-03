export const dynamic = "force-dynamic";

import { BookOpen, Library, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/services/dashboard";
import KpiCard from "@/components/ui/KpiCard";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Vue d&apos;ensemble de votre collection
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Albums"
          value={stats.totalAlbums}
          icon={BookOpen}
          color="primary"
        />
        <KpiCard
          title="Séries"
          value={stats.totalSeries}
          icon={Library}
          color="secondary"
        />
        <KpiCard
          title="Éditions originales"
          value={stats.originalEditions}
          icon={Star}
          color="accent"
        />
        <KpiCard
          title="Éditeurs"
          value={stats.publisherDistribution.length}
          icon={TrendingUp}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">
              Derniers ajouts
            </h2>
            <Link
              href="/albums"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Voir tout
            </Link>
          </div>
          {stats.recentAlbums.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              Aucun album pour le moment.{" "}
              <Link href="/albums/new" className="text-primary hover:underline">
                Ajouter votre premier album
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-alt transition-colors"
                >
                  <CoverImage
                    src={album.coverImageUrl}
                    alt={album.title}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {album.series.title}
                      {album.author && ` — ${album.author}`}
                    </p>
                  </div>
                  {album.isOriginalEdition && (
                    <Badge variant="success">EO</Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">
                Par éditeur
              </h2>
            </div>
            {stats.publisherDistribution.length === 0 ? (
              <div className="p-4 text-sm text-text-muted text-center">
                Aucune donnée
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {stats.publisherDistribution.map((item) => (
                  <div key={item.publisher} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {item.publisher}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-text-secondary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">
                Par auteur
              </h2>
            </div>
            {stats.authorDistribution.length === 0 ? (
              <div className="p-4 text-sm text-text-muted text-center">
                Aucune donnée
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {stats.authorDistribution.map((item) => (
                  <div key={item.author} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {item.author}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-text-secondary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Actions rapides
            </h2>
            <div className="space-y-2">
              <Link
                href="/albums/new"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
              >
                <BookOpen className="h-4 w-4" />
                Ajouter un album
              </Link>
              <Link
                href="/series/new"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
              >
                <Library className="h-4 w-4" />
                Créer une série
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
