"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import type { CollectionSeriesSummary } from "@/lib/services/collectionItems.service";

const STORAGE_KEY = "bdcollection:collectionHubView";

type ViewMode = "cards" | "table";

export default function CollectionSeriesHubClient({ summaries }: { summaries: CollectionSeriesSummary[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (v === "cards" || v === "table") setViewMode(v);
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-text-secondary">
          Choisissez une série pour voir les albums suivis et affiner possession, EO ou statut de recherche.
        </p>
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface-alt/50">
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
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            Grille
          </button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((s) => (
            <Link
              key={s.id}
              href={`/collection/${s.id}`}
              className="group flex gap-4 rounded-xl border border-border bg-white p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <CoverImage src={s.coverImageUrl} alt={s.title} size="lg" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-text-primary group-hover:text-primary line-clamp-2">
                  {s.title}
                </h2>
                {s.authors?.trim() && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{s.authors}</p>
                )}
                <p className="text-xs text-text-secondary mt-3">
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
