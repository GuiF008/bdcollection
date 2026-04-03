export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getAlbums, getDistinctAuthors, getDistinctAlbumPublishers } from "@/lib/services/albums";
import { getSeriesForSelect } from "@/lib/services/series";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import AlbumListClient from "@/components/albums/AlbumListClient";

export default async function AlbumsPage() {
  const [albums, authors, publishers, seriesList] = await Promise.all([
    getAlbums(),
    getDistinctAuthors(),
    getDistinctAlbumPublishers(),
    getSeriesForSelect(),
  ]);

  return (
    <div>
      <PageHeader
        title="Tous les albums"
        description={`${albums.length} album(s) dans votre collection`}
        actions={
          <Link
            href="/albums/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un album
          </Link>
        }
      />

      {albums.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucun album"
          description="Commencez par ajouter votre premier album de bande dessinée."
          actionLabel="Ajouter un album"
          actionHref="/albums/new"
        />
      ) : (
        <AlbumListClient
          albums={albums}
          authors={authors}
          publishers={publishers}
          seriesList={seriesList}
        />
      )}
    </div>
  );
}
