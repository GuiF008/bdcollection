"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CheckSquare, LayoutGrid, List, Square } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import type { CollectionSeriesSummary } from "@/lib/services/collectionItems.service";
import { addSeriesToCollectionGroupAction } from "@/app/actions/collectionGroups";

/** Même clé que « Ma collection » pour un affichage cohérent. */
const STORAGE_KEY = "bdcollection:collectionHubView";

type ViewMode = "list" | "cards";

type GroupOpt = { id: string; name: string };

function SeriesProgress({ s }: { s: CollectionSeriesSummary }) {
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

export default function DashboardCollectionPreviewClient({
  summaries,
  groups,
}: {
  summaries: CollectionSeriesSummary[];
  groups: GroupOpt[];
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupId, setGroupId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

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

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible(checked: boolean) {
    const ids = summaries.map((s) => s.id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  const allSelected = summaries.length > 0 && summaries.every((s) => selected.has(s.id));

  function addToGroup() {
    const ids = Array.from(selected);
    setFeedback(null);
    start(async () => {
      const r = await addSeriesToCollectionGroupAction(ids, groupId);
      if (r.ok) {
        setSelected(new Set());
        setGroupId("");
        setFeedback(`${r.count} série(s) ajoutée(s) au groupe.`);
        router.refresh();
      } else {
        setFeedback(r.error);
      }
    });
  }

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-success" />
          Ma collection · séries suivies
        </h2>
        <div className="flex flex-wrap items-center gap-2">
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
          <Link href="/collection" className="text-sm text-primary hover:underline font-medium">
            Tout voir
          </Link>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Même mode liste / cartes que sur la page Ma collection. Cochez des séries puis ajoutez-les à un groupe
        (les autres groupes de chaque série sont conservés).
      </p>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 p-4 rounded-xl border border-primary/25 bg-primary/5">
          <span className="text-sm font-medium text-text-primary">
            {selected.size} série{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
          {groups.length > 0 ? (
            <>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm min-w-[200px]"
              >
                <option value="">Choisir un groupe…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={pending || !groupId}
                onClick={addToGroup}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {pending ? "Enregistrement…" : "Ajouter au groupe"}
              </button>
            </>
          ) : (
            <span className="text-sm text-text-secondary">
              <Link href="/collection/groups" className="text-primary font-medium hover:underline">
                Créez un groupe
              </Link>{" "}
              pour classer vos séries.
            </span>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Tout désélectionner
          </button>
          {feedback && <span className="text-sm text-text-secondary sm:w-full">{feedback}</span>}
        </div>
      )}

      {viewMode === "cards" ? (
        <div>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => selectAllVisible(!allSelected)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {summaries.map((s) => (
              <div
                key={s.id}
                className="relative rounded-xl border border-border bg-white overflow-hidden hover:border-primary/35 hover:shadow-md transition-all"
              >
                <label className="absolute top-2 left-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/90 border border-border shadow-sm">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                </label>
                <Link href={`/collection/${s.id}`} className="block p-4 pt-12">
                  <div className="flex gap-4">
                    <CoverImage src={s.coverImageUrl} alt={s.title} size="lg" className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary line-clamp-2">{s.title}</p>
                      <p className="text-xs text-text-muted mt-2">
                        {s.itemCount} suivi{s.itemCount > 1 ? "s" : ""}
                        {s.ownedCount > 0 && (
                          <>
                            {" "}
                            · <span className="text-success font-medium">{s.ownedCount}</span> possédé
                            {s.ownedCount > 1 ? "s" : ""}
                          </>
                        )}
                      </p>
                      <SeriesProgress s={s} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-alt/30">
            <button
              type="button"
              onClick={() => selectAllVisible(!allSelected)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-left text-text-muted">
                <th className="px-3 py-3 w-10" />
                <th className="px-4 py-3 font-medium w-14" />
                <th className="px-4 py-3 font-medium">Série</th>
                <th className="px-4 py-3 font-medium text-right">Suivis</th>
                <th className="px-4 py-3 font-medium text-right">Possédés</th>
                <th className="px-4 py-3 font-medium min-w-[140px]">Complétude</th>
                <th className="px-4 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-alt/30">
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CoverImage src={s.coverImageUrl} alt={s.title} size="sm" />
                  </td>
                  <td className="px-4 py-2 font-medium text-text-primary">{s.title}</td>
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
