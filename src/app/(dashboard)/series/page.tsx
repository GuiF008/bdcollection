export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Library } from "lucide-react";
import { getSeries } from "@/lib/services/series";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CoverImage from "@/components/ui/CoverImage";

export default async function SeriesPage() {
  const series = await getSeries();

  return (
    <div>
      <PageHeader
        title="Séries / Collections"
        description={`${series.length} série(s) dans votre collection`}
        actions={
          <Link
            href="/series/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle série
          </Link>
        }
      />

      {series.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Aucune série"
          description="Créez votre première série ou collection pour commencer à organiser vos bandes dessinées."
          actionLabel="Créer une série"
          actionHref="/series/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex gap-4">
                <CoverImage
                  src={s.coverImageUrl}
                  alt={s.title}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                    {s.title}
                  </h3>
                  {s.authors && (
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {s.authors}
                    </p>
                  )}
                  {s.publisher && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {s.publisher}
                    </p>
                  )}
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {s._count.albums} album{s._count.albums !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              {s.description && (
                <p className="text-xs text-text-muted mt-3 line-clamp-2">
                  {s.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
