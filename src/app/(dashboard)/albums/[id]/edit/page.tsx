export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import AlbumForm from "@/components/forms/AlbumForm";
import { getAlbumById } from "@/lib/services/albums";
import { getSeriesForSelect } from "@/lib/services/series";

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [album, seriesList] = await Promise.all([
    getAlbumById(id),
    getSeriesForSelect(),
  ]);

  if (!album) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Modifier : ${album.title}`}
        description="Modifiez les informations de l'album"
      />
      <AlbumForm album={album} seriesList={seriesList} />
    </div>
  );
}
