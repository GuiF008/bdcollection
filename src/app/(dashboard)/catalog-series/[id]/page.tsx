import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import CoverImage from "@/components/ui/CoverImage";
import RefreshCatalogSeriesButton from "@/components/catalog/RefreshCatalogSeriesButton";
import { getCatalogSeriesById } from "@/server/scraping/services/series-cache.service";
import { isCacheStale } from "@/server/scraping/utils/dates";

type Props = { params: Promise<{ id: string }> };

export default async function CatalogSeriesDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getCatalogSeriesById(id);
  if (!data) notFound();

  const stale = isCacheStale(data.cacheExpiresAt);

  return (
    <div>
      <Link
        href="/import-export"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à Import / Export
      </Link>

      <PageHeader
        title={data.title}
        description={`Cache Bedetheque · ID source ${data.sourceSeriesId}`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {stale ? <Badge variant="warning">Cache expiré (à rafraîchir)</Badge> : <Badge variant="success">Cache valide</Badge>}
        <span className="text-sm text-text-muted">
          Expire le {data.cacheExpiresAt.toLocaleDateString("fr-FR")}
        </span>
      </div>

      <div className="mb-8">
        <RefreshCatalogSeriesButton seriesId={data.id} />
      </div>

      {data.summary && (
        <div className="mb-8 p-4 rounded-xl border border-border bg-white">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Résumé (site)</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            Albums en cache ({data.albums.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-left text-text-muted">
                <th className="px-4 py-3 font-medium w-14" />
                <th className="px-4 py-3 font-medium">Tome</th>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Auteurs</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Éditeur</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">ISBN</th>
              </tr>
            </thead>
            <tbody>
              {data.albums.map((album) => (
                <tr key={album.id} className="border-b border-border last:border-0 hover:bg-surface-alt/30">
                  <td className="px-4 py-2">
                    <CoverImage src={album.coverImageUrl} alt={album.title} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                    {album.volumeNumber ?? album.volumeLabel ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-medium text-text-primary">{album.title}</td>
                  <td className="px-4 py-2 text-text-secondary hidden md:table-cell max-w-[200px] truncate">
                    {album.authorsText ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-text-secondary hidden lg:table-cell">
                    {album.publisher ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-text-muted font-mono text-xs hidden lg:table-cell">
                    {album.isbn ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-text-muted">
        Ces lignes ne sont pas votre collection personnelle. Pour en faire des albums de
        collection, importez ou créez-les depuis les écrans Séries / Albums.
      </p>
    </div>
  );
}
