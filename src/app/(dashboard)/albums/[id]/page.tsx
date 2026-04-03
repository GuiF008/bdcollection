export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, Calendar, Hash, Building2, User } from "lucide-react";
import { getAlbumById } from "@/lib/services/albums";
import PageHeader from "@/components/ui/PageHeader";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import DeleteAlbumButton from "@/components/actions/DeleteAlbumButton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbumById(id);

  if (!album) {
    notFound();
  }

  const infoItems = [
    {
      icon: User,
      label: "Auteur",
      value: album.author,
    },
    {
      icon: Building2,
      label: "Éditeur",
      value: album.publisher,
    },
    {
      icon: Calendar,
      label: "Date de parution",
      value: album.publicationDate
        ? format(new Date(album.publicationDate), "d MMMM yyyy", { locale: fr })
        : null,
    },
    {
      icon: Hash,
      label: "Tome",
      value: album.volumeNumber?.toString(),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/albums"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux albums
        </Link>
      </div>

      <PageHeader
        title={album.title}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/albums/${id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
            <DeleteAlbumButton id={id} title={album.title} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <CoverImage
            src={album.coverImageUrl}
            alt={album.title}
            size="lg"
          />
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {album.isOriginalEdition && (
              <Badge variant="success">Édition originale</Badge>
            )}
            <Link href={`/series/${album.seriesId}`}>
              <Badge variant="primary">{album.series.title}</Badge>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              Informations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map(
                (item) =>
                  item.value && (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt flex-shrink-0">
                        <item.icon className="h-4 w-4 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">{item.label}</p>
                        <p className="text-sm font-medium text-text-primary">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>

            {(album.isbn || album.ean) && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {album.isbn && (
                  <div>
                    <p className="text-xs text-text-muted">ISBN</p>
                    <p className="text-sm font-mono text-text-primary">
                      {album.isbn}
                    </p>
                  </div>
                )}
                {album.ean && (
                  <div>
                    <p className="text-xs text-text-muted">EAN</p>
                    <p className="text-sm font-mono text-text-primary">
                      {album.ean}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {album.summary && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Résumé
              </h2>
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {album.summary}
              </p>
            </div>
          )}

          {album.personalNotes && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Notes personnelles
              </h2>
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {album.personalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
