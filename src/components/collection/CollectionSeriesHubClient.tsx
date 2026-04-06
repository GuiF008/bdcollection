"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, LayoutGrid, List } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import type { CollectionSeriesSummary } from "@/lib/services/collectionItems.service";

const STORAGE_KEY = "bdcollection:collectionHubView";

type ViewMode = "list" | "cards";

type GroupOpt = { id: string; name: string };

function SeriesProgress({ summary: s }: { summary: CollectionSeriesSummary }) {
  const total = s.catalogAlbumCount;
  const pct = s.ownershipProgressPercent;
  if (total <= 0) {
    return (
      <p className="text-[11px] text-text-muted mt-2">Aucun album dans le catalogue importé pour cette série.</p>
    );
  }
  return (
    <div className="mt-2">
      <div className="flex justify-between gap-2 text-[11px] text-text-muted mb-0.5">
        <span>Possédés / catalogue</span>
        <span className="tabular-nums shrink-0">
          {s.ownedCount} / {total} · {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CollectionSeriesHubClient({
  summaries,
  groups,
  activeGroupId,
}: {
  summaries: CollectionSeriesSummary[];
  groups: GroupOpt[];
  activeGroupId: string | null;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as ViewMode | "table" | null;
      if (v === "table") setViewMode("list");
      else if (v === "list" || v === "cards") setViewMode(v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary max-w-xl">
            Liste ou cartes, barre de complétude (possédés / albums du catalogue). Filtrez par groupe si besoin.
          </p>
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface-alt/50">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "cards"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cartes
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-text-muted inline-flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            Groupe :
          </span>
          {groups.length > 0 ? (
            <>
              <select
                value={activeGroupId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  router.push(v ? `/collection?group=${encodeURIComponent(v)}` : "/collection");
                }}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm min-w-[200px]"
              >
                <option value="">Toutes les séries</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <Link
                href="/collection/groups"
                className="text-xs font-medium text-primary hover:underline ml-1"
              >
                Gérer les groupes
              </Link>
            </>
          ) : (
            <span className="text-text-muted text-sm">
              Aucun —{" "}
              <Link href="/collection/groups" className="text-primary font-medium hover:underline">
                créer des groupes
              </Link>{" "}
              pour filtrer.
            </span>
          )}
        </div>
      </div>

      {summaries.length === 0 ? (
        <p className="text-sm text-text-muted py-6">
          {activeGroupId
            ? "Aucune série suivie dans ce groupe. Assignez des séries depuis leur fiche ou choisissez un autre groupe."
            : "Aucune série à afficher."}
        </p>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((s) => (
            <Link
              key={s.id}
              href={`/collection/${s.id}`}
              className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-white p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <CoverImage src={s.coverImageUrl} alt={s.title} size="lg" className="shrink-0 mx-auto sm:mx-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-text-primary group-hover:text-primary line-clamp-2">
                  {s.title}
                </h2>
                {s.authors?.trim() && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{s.authors}</p>
                )}
                <p className="text-xs text-text-secondary mt-2">
                  <span className="font-medium text-text-primary">{s.itemCount}</span> album
                  {s.itemCount > 1 ? "s" : ""} suivi{s.itemCount > 1 ? "s" : ""}
                  {s.ownedCount > 0 && (
                    <>
                      {" "}
                      · <span className="font-medium text-success">{s.ownedCount}</span> possédé
                      {s.ownedCount > 1 ? "s" : ""}
                    </>
                  )}
                </p>
                <SeriesProgress summary={s} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-left text-text-muted">
                <th className="px-4 py-3 font-medium w-16" />
                <th className="px-4 py-3 font-medium">Série</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Auteurs</th>
                <th className="px-4 py-3 font-medium text-right">Suivis</th>
                <th className="px-4 py-3 font-medium text-right">Possédés</th>
                <th className="px-4 py-3 font-medium min-w-[140px]">Complétude</th>
                <th className="px-4 py-3 font-medium w-28" />
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-alt/30">
                  <td className="px-4 py-2">
                    <CoverImage src={s.coverImageUrl} alt={s.title} size="sm" />
                  </td>
                  <td className="px-4 py-2 font-medium text-text-primary">{s.title}</td>
                  <td className="px-4 py-2 text-text-muted hidden md:table-cell max-w-[200px] truncate">
                    {s.authors ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.itemCount}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-success">{s.ownedCount}</td>
                  <td className="px-4 py-2 align-middle">
                    {s.catalogAlbumCount > 0 ? (
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden min-w-0">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${s.ownershipProgressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-text-muted shrink-0">
                          {s.ownershipProgressPercent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/collection/${s.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
