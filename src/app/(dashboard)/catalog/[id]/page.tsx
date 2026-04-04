export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import CoverImage from "@/components/ui/CoverImage";
import RefreshCatalogSeriesButton from "@/components/catalog/RefreshCatalogSeriesButton";
import CatalogAlbumQuickActions from "@/components/catalog/CatalogAlbumQuickActions";
import { getAlbumsForSeriesCatalog } from "@/lib/services/catalogReferences.service";
import { getSeriesReferenceById } from "@/server/scraping/services/series-cache.service";
import { isCacheStale } from "@/server/scraping/utils/dates";

type Props = { params: Promise<{ id: string }> };

export default async function CatalogSeriesDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getSeriesReferenceById(id);
  if (!data) notFound();

  const stale = isCacheStale(data.cacheExpiresAt);
  const albums = await getAlbumsForSeriesCatalog(id);

  const ownedCount = albums.filter((a) => a.flags.owned).length;
  const eoOk = albums.filter((a) => a.flags.eoConfirmed).length;
  const missing = albums.length - ownedCount;

  return (
    <div>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au catalogue
      </Link>

      <PageHeader
        title={data.title}
        description={`${data.sourceName ?? data.source} · ${data.sourceSeriesId}`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {stale ? <Badge variant="warning">Cache expiré (à rafraîchir)</Badge> : <Badge variant="success">Cache valide</Badge>}
        <span className="text-sm text-text-muted">
          Expire le {data.cacheExpiresAt.toLocaleDateString("fr-FR")}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Albums référencés" value={albums.length} />
        <Stat label="Possédés" value={ownedCount} />
        <Stat label="EO confirmées" value={eoOk} />
        <Stat label="Manquants" value={missing} />
      </div>

      <div className="mb-6">
        <RefreshCatalogSeriesButton seriesId={data.id} />
      </div>

      {data.summary && (
        <div className="mb-8 p-4 rounded-xl border border-border bg-white">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Résumé</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">Albums du catalogue ({albums.length})</h2>
          <p className="text-xs text-text-muted mt-1">
            Utilisez les actions pour suivre ou marquer comme possédé — l’import ne signifie pas la possession.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-left text-text-muted">
                <th className="px-4 py-3 font-medium w-14" />
                <th className="px-4 py-3 font-medium">Tome</th>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Statut</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id} className="border-b border-border last:border-0 hover:bg-surface-alt/30">
                  <td className="px-4 py-2">
                    <CoverImage src={album.coverImageUrl} alt={album.title} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                    {album.volumeNumber ?? album.volumeLabel ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-text-primary">{album.title}</p>
                    <p className="text-xs text-text-muted truncate max-w-[240px] md:hidden mt-1">
                      {album.flags.owned && "Dans ma collection "}
                      {album.flags.eoConfirmed && "EO "}
                      {album.flags.wanted && "Recherché "}
                    </p>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="default">Catalogue</Badge>
                      {album.flags.owned && <Badge variant="success">Collection</Badge>}
                      {album.flags.eoConfirmed && <Badge variant="primary">EO</Badge>}
                      {album.flags.eoToVerify && !album.flags.eoConfirmed && (
                        <Badge variant="warning">EO à vérifier</Badge>
                      )}
                      {!album.flags.owned && !album.flags.wanted && (
                        <Badge variant="warning">Manquant</Badge>
                      )}
                      {album.flags.wanted && <Badge variant="default">Recherché</Badge>}
                      {album.flags.duplicate && <Badge variant="warning">Doublon</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2 hidden lg:table-cell align-top">
                    <CatalogAlbumQuickActions
                      albumReferenceId={album.id}
                      hasOwned={album.flags.owned}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
