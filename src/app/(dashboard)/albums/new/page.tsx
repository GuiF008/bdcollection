import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import AddAlbumSearchClient from "@/components/albums/AddAlbumSearchClient";

export default function AddAlbumPage() {
  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <PageHeader
        title="Ajouter un album"
        description="Recherchez dans le catalogue importé ou importez une nouvelle série."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-base font-semibold text-text-primary mb-1">
              Rechercher dans le catalogue
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Trouvez un album déjà importé et ajoutez-le à votre collection en un clic.
            </p>
            <AddAlbumSearchClient />
          </div>
        </div>

        <div>
          <Link
            href="/import-export"
            className="block rounded-xl border border-dashed border-border bg-surface-alt/30 p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <Globe className="h-6 w-6 text-primary mb-3" />
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              Importer une série
            </h2>
            <p className="text-xs text-text-muted">
              Votre série n&apos;est pas encore dans le catalogue ? Importez-la depuis Bedetheque.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
