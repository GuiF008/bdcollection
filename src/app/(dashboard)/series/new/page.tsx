import PageHeader from "@/components/ui/PageHeader";
import SeriesForm from "@/components/forms/SeriesForm";

export default function NewSeriesPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Nouvelle série"
        description="Créez une nouvelle série ou collection"
      />
      <SeriesForm />
    </div>
  );
}
