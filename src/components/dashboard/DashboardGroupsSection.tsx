import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import type { CollectionGroupDashboardRow } from "@/lib/services/collectionGroups.service";

export type DashboardGroupRow = CollectionGroupDashboardRow;

/** Hauteur / gabarit alignés sur les KpiCard (lg) : min-h-[104px], p-6, rounded-xl */
const compactCardClass =
  "bg-white rounded-xl border border-border flex items-center gap-4 p-6 min-h-[104px] transition-[box-shadow,border-color] hover:border-primary/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export default function DashboardGroupsSection({ groups }: { groups: DashboardGroupRow[] }) {
  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-primary shrink-0" />
          Groupes de séries
        </h2>
        <Link
          href="/collection/groups"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
        >
          Gérer
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {groups.length === 0 ? (
        <Link
          href="/collection/groups"
          className={`${compactCardClass} w-full max-w-md`}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderKanban className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-secondary">Aucun groupe</p>
            <p className="font-bold text-text-primary text-lg mt-0.5">Créer un groupe</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text-muted shrink-0" />
        </Link>
      ) : (
        <div className="flex flex-wrap gap-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/collection?group=${encodeURIComponent(g.id)}`}
              className={`${compactCardClass} flex-1 min-w-[200px] max-w-sm`}
            >
              <CoverImage
                src={g.previewCoverUrl}
                alt={
                  g.previewSeriesTitle
                    ? `Première série : ${g.previewSeriesTitle}`
                    : `Groupe ${g.name}`
                }
                size="sm"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-secondary line-clamp-1">{g.name}</p>
                <p className="font-bold text-text-primary text-2xl mt-0.5 tabular-nums">
                  {g._count.memberships}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  série{g._count.memberships > 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
