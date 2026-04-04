export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Hash, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PageHeader from "@/components/ui/PageHeader";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import CollectionItemForm from "@/components/collection/CollectionItemForm";
import InitCollectionPanel from "@/components/collection/InitCollectionPanel";
import { getAlbumReferenceDetail } from "@/lib/services/collectionItems.service";
import RemoveFromCollectionButton from "@/components/collection/RemoveFromCollectionButton";

export default async function AlbumReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAlbumReferenceDetail(id);
  if (!detail) notFound();

  const { seriesReference: sr } = detail;
  const primary =
    detail.collectionItems.find((c) => c.ownershipStatus === "OWNED") ?? detail.collectionItems[0];

  const infoItems = [
    { icon: User, label: "Auteur(s)", value: detail.authors },
    { icon: Building2, label: "Éditeur", value: detail.publisher },
    {
      icon: Calendar,
      label: "Date de parution",
      value: detail.publicationDate
        ? format(new Date(detail.publicationDate), "d MMMM yyyy", { locale: fr })
        : null,
    },
    {
      icon: Hash,
      label: "Tome",
      value: detail.volumeNumber?.toString() ?? detail.volumeLabel ?? null,
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/catalog/${sr.id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la série
        </Link>
      </div>

      <PageHeader title={detail.title} description={sr.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <CoverImage src={detail.coverImageUrl} alt={detail.title} size="lg" />
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Badge variant="default">Catalogue importé</Badge>
            <Link href="/collection">
              <Badge variant="primary">Ma collection</Badge>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              Informations de référence
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
                        <p className="text-sm font-medium text-text-primary">{item.value}</p>
                      </div>
                    </div>
                  )
              )}
            </div>
            {detail.isbn && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-muted">ISBN</p>
                <p className="text-sm font-mono text-text-primary">{detail.isbn}</p>
              </div>
            )}
            {detail.summary && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-muted mb-2">Résumé</p>
                <p className="text-sm text-text-secondary whitespace-pre-line">{detail.summary}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              Mon exemplaire
            </h2>
            {primary ? (
              <>
                <CollectionItemForm item={primary} albumReferenceId={detail.id} />
                <div className="mt-6 pt-4 border-t border-border">
                  <RemoveFromCollectionButton
                    collectionItemId={primary.id}
                    albumReferenceId={detail.id}
                  />
                </div>
              </>
            ) : (
              <InitCollectionPanel albumReferenceId={detail.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
