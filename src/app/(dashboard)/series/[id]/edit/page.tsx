export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import SeriesForm from "@/components/forms/SeriesForm";
import { getSeriesById } from "@/lib/services/series";

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await getSeriesById(id);

  if (!series) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Modifier : ${series.title}`}
        description="Modifiez les informations de la série"
      />
      <SeriesForm series={series} />
    </div>
  );
}
