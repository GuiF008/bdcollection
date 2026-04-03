export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, ArrowLeft } from "lucide-react";
import { getSeriesById } from "@/lib/services/series";
import { getAlbumsBySeriesId } from "@/lib/services/albums";
import PageHeader from "@/components/ui/PageHeader";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import DeleteSeriesButton from "@/components/actions/DeleteSeriesButton";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await getSeriesById(id);

  if (!series) {
    notFound();
  }

  const albums = await getAlbumsBySeriesId(id);

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/series"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux séries
        </Link>
      </div>

      <PageHeader
        title={series.title}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/series/${id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
            <DeleteSeriesButton id={id} title={series.title} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex flex-col items-center">
            <CoverImage
              src={series.coverImageUrl}
              alt={series.title}
              size="lg"
            />
            <div className="mt-4 text-center">
              <h2 className="text-lg font-semibold text-text-primary">
                {series.title}
              </h2>
              {series.authors && (
                <p className="text-sm text-text-secondary mt-1">
                  {series.authors}
                </p>
              )}
              {series.publisher && (
                <p className="text-sm text-text-muted mt-0.5">
                  {series.publisher}
                </p>
              )}
              <div className="mt-3">
                <Badge variant="primary">
                  {series._count.albums} album
                  {series._count.albums !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>

          {series.description && (
            <div className="mt-5 pt-5 border-t border-border">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-line">
                {series.description}
              </p>
            </div>
          )}

          {series.personalNotes && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Notes personnelles
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-line">
                {series.personalNotes}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">
                Albums ({albums.length})
              </h2>
              <Link
                href={`/albums/new?seriesId=${id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </Link>
            </div>

            {albums.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                Aucun album dans cette série.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {albums.map((album) => (
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
                      <div className="flex items-center gap-2">
                        {album.volumeNumber && (
                          <span className="text-xs font-bold text-primary">
                            T.{album.volumeNumber}
                          </span>
                        )}
                        <p className="text-sm font-medium text-text-primary truncate">
                          {album.title}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {[album.author, album.publisher]
                          .filter(Boolean)
                          .join(" — ")}
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
        </div>
      </div>
    </div>
  );
}
