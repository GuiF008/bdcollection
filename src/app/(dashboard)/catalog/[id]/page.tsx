export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import RefreshCatalogSeriesButton from "@/components/catalog/RefreshCatalogSeriesButton";
import CatalogAlbumsClient, {
  type CatalogAlbumRow,
} from "@/components/catalog/CatalogAlbumsClient";
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

  const albumRows: CatalogAlbumRow[] = albums.map((a) => ({
    id: a.id,
    title: a.title,
    coverImageUrl: a.coverImageUrl,
    volumeNumber: a.volumeNumber,
    volumeLabel: a.volumeLabel,
    flags: a.flags,
  }));

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
            L’import ne signifie pas la possession : ajoutez au suivi ici, puis précisez le statut dans Ma collection.
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <CatalogAlbumsClient seriesReferenceId={data.id} albums={albumRows} />
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
