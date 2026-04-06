import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import type { CollectionGroupDashboardRow } from "@/lib/services/collectionGroups.service";

export type DashboardGroupRow = CollectionGroupDashboardRow;

function firstAvailableCover(groups: DashboardGroupRow[]): {
  url: string | null;
  title: string;
} {
  for (const g of groups) {
    if (g.previewCoverUrl) {
      return { url: g.previewCoverUrl, title: g.previewSeriesTitle ?? g.name };
    }
  }
  return { url: null, title: "Groupes de séries" };
}

export default function DashboardGroupsSection({ groups }: { groups: DashboardGroupRow[] }) {
  const hero = firstAvailableCover(groups);

  return (
    <section className="mb-10 rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
      <div className="grid lg:grid-cols-[minmax(260px,340px)_1fr] gap-0">
        <div className="relative flex flex-col items-center lg:items-start text-center lg:text-left p-8 lg:p-10 bg-gradient-to-br from-primary/[0.07] via-white to-secondary/[0.08] border-b lg:border-b-0 lg:border-r border-border">
          <div className="mb-5 flex justify-center lg:justify-start w-full">
            <CoverImage
              src={hero.url}
              alt={hero.title ? `Couverture : ${hero.title}` : "Aperçu groupe"}
              size="lg"
              className="shadow-md"
            />
          </div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 justify-center lg:justify-start">
            <FolderKanban className="h-5 w-5 text-primary shrink-0" />
            Groupes de séries
          </h2>
          <p className="text-sm text-text-secondary mt-2 max-w-sm">
            Regroupez vos séries suivies pour filtrer plus vite dans Ma collection.
          </p>
          <Link
            href="/collection/groups"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Créer ou renommer des groupes
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="p-6 lg:p-8 min-h-[200px] flex flex-col">
          {groups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
              <p className="text-sm text-text-secondary max-w-md">
                Vous n’avez pas encore de groupe. Créez-en un pour organiser vos séries (ex. « À compléter »,
                « EO »).
              </p>
              <Link
                href="/collection/groups"
                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-95"
              >
                Créer un groupe
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-4">
                {groups.length} groupe{groups.length > 1 ? "s" : ""}
              </p>
              <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {groups.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/collection?group=${encodeURIComponent(g.id)}`}
                      className="group flex flex-col h-full rounded-xl border border-border bg-surface-alt/40 overflow-hidden hover:border-primary/35 hover:bg-white hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <div className="flex justify-center pt-5 px-5 pb-2 bg-surface-alt/60 group-hover:bg-surface-alt/40 transition-colors">
                        <CoverImage
                          src={g.previewCoverUrl}
                          alt={
                            g.previewSeriesTitle
                              ? `Première série du groupe : ${g.previewSeriesTitle}`
                              : `Groupe ${g.name}`
                          }
                          size="md"
                          className="shadow-sm"
                        />
                      </div>
                      <div className="px-5 pb-5 pt-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors min-w-0">
                            {g.name}
                          </p>
                          <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                        </div>
                        <p className="mt-1 text-sm text-text-muted">
                          {g._count.memberships} série{g._count.memberships > 1 ? "s" : ""}
                        </p>
                        <span className="mt-auto pt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Voir dans Ma collection
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
