export const dynamic = "force-dynamic";

import PageHeader from "@/components/ui/PageHeader";
import AlbumForm from "@/components/forms/AlbumForm";
import { getSeriesForSelect } from "@/lib/services/series";

export default async function NewAlbumPage({
  searchParams,
}: {
  searchParams: Promise<{ seriesId?: string }>;
}) {
  const { seriesId } = await searchParams;
  const seriesList = await getSeriesForSelect();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Nouvel album"
        description="Ajoutez un album à votre collection"
      />
      <AlbumForm seriesList={seriesList} defaultSeriesId={seriesId} />
    </div>
  );
}
