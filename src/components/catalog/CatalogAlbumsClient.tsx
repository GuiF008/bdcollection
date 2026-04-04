"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckSquare, LayoutGrid, Square, Table2 } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import CatalogAlbumQuickActions from "@/components/catalog/CatalogAlbumQuickActions";
import { bulkCollectionStatusAction, type BulkCollectionMode } from "@/app/actions/references";

export type CatalogAlbumRow = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  volumeNumber: number | null;
  volumeLabel: string | null;
  flags: {
    owned: boolean;
    wanted: boolean;
    tracked: boolean;
    eoConfirmed: boolean;
    eoToVerify: boolean;
    duplicate: boolean;
  };
};

type ViewMode = "table" | "cards";

const STORAGE_KEY = "bdcollection:catalogAlbumView";

export default function CatalogAlbumsClient({
  seriesReferenceId,
  albums,
}: {
  seriesReferenceId: string;
  albums: CatalogAlbumRow[];
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (v === "table" || v === "cards") setViewMode(v);
    } catch {
      /* ignore */
    }
  }, []);

  function persistView(mode: ViewMode) {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(checked: boolean) {
    if (checked) setSelected(new Set(albums.map((a) => a.id)));
    else setSelected(new Set());
  }

  const allSelected = albums.length > 0 && albums.every((a) => selected.has(a.id));

  function runBulk(mode: BulkCollectionMode) {
    const ids = Array.from(selected);
    startBulk(async () => {
      await bulkCollectionStatusAction(ids, mode);
      setSelected(new Set());
      router.refresh();
    });
  }

  const toolbar =
    selected.size > 0 ? (
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-primary/25 bg-primary/5">
        <p className="text-sm font-medium text-text-primary">
          {selected.size} album{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={bulkPending}
            onClick={() => runBulk("tracking")}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium disabled:opacity-50"
          >
            Ajouter au suivi
          </button>
          <button
            type="button"
            disabled={bulkPending}
            onClick={() => runBulk("owned")}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-50"
          >
            Dans ma collection
          </button>
          <button
            type="button"
            disabled={bulkPending}
            onClick={() => runBulk("wanted")}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium disabled:opacity-50"
          >
            Recherché
          </button>
          <button
            type="button"
            disabled={bulkPending}
            onClick={() => runBulk("hunting")}
            className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium disabled:opacity-50"
          >
            À chasser
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary"
          >
            Tout désélectionner
          </button>
        </div>
      </div>
    ) : null;

  function statusCell(album: CatalogAlbumRow) {
    return (
      <div className="flex flex-wrap gap-1">
        <Badge variant="default">Catalogue</Badge>
        {album.flags.tracked && <Badge variant="success">Suivi</Badge>}
        {album.flags.owned && <Badge variant="success">Possédé</Badge>}
        {album.flags.eoConfirmed && <Badge variant="primary">EO</Badge>}
        {album.flags.eoToVerify && !album.flags.eoConfirmed && <Badge variant="warning">EO à vérifier</Badge>}
        {!album.flags.owned && !album.flags.wanted && !album.flags.tracked && <Badge variant="warning">Pas suivi</Badge>}
        {album.flags.wanted && <Badge variant="default">Recherché</Badge>}
        {album.flags.duplicate && <Badge variant="warning">Doublon</Badge>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted max-w-xl">
          Ajoutez au suivi depuis le catalogue, puis précisez possession ou recherche dans{" "}
          <Link href={`/collection/${seriesReferenceId}`} className="text-primary font-medium hover:underline">
            Ma collection · cette série
          </Link>
          . Sélection multiple et actions groupées ci-dessous.
        </p>
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface-alt/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => persistView("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
              viewMode === "table"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            Grille
          </button>
          <button
            type="button"
            onClick={() => persistView("cards")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
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

      {toolbar}

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50 text-left text-text-muted">
                <th className="px-2 py-3 w-10">
                  <button
                    type="button"
                    onClick={() => selectAll(!allSelected)}
                    className="p-1 text-text-secondary hover:text-primary"
                    aria-label={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  >
                    {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium w-14" />
                <th className="px-4 py-3 font-medium">Tome</th>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Statut</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id} className="border-b border-border last:border-0 hover:bg-surface-alt/30">
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="checkbox"
                      className="rounded border-border ml-1"
                      checked={selected.has(album.id)}
                      onChange={() => toggle(album.id)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <CoverImage src={album.coverImageUrl} alt={album.title} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                    {album.volumeNumber ?? album.volumeLabel ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-text-primary">{album.title}</p>
                    <p className="text-xs text-text-muted truncate max-w-[240px] md:hidden mt-1">
                      {album.flags.owned && "Possédé "}
                      {album.flags.tracked && !album.flags.owned && "Suivi "}
                      {album.flags.eoConfirmed && "EO "}
                      {album.flags.wanted && "Recherché "}
                    </p>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">{statusCell(album)}</td>
                  <td className="px-4 py-2 align-top">
                    <CatalogAlbumQuickActions
                      albumReferenceId={album.id}
                      seriesReferenceId={seriesReferenceId}
                      tracked={album.flags.tracked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => selectAll(!allSelected)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="relative rounded-xl border border-border bg-white overflow-hidden hover:border-primary/25 transition-colors"
              >
                <label className="absolute top-2 left-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/90 border border-border shadow-sm">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.has(album.id)}
                    onChange={() => toggle(album.id)}
                  />
                </label>
                <div className="p-3 pt-11">
                  <div className="flex justify-center mb-2">
                    <CoverImage src={album.coverImageUrl} alt={album.title} size="md" />
                  </div>
                  <p className="text-xs text-text-muted">
                    {album.volumeNumber ?? album.volumeLabel ?? "—"}
                  </p>
                  <p className="text-sm font-medium text-text-primary line-clamp-2 mt-0.5">{album.title}</p>
                  <div className="mt-2">{statusCell(album)}</div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <CatalogAlbumQuickActions
                      albumReferenceId={album.id}
                      seriesReferenceId={seriesReferenceId}
                      tracked={album.flags.tracked}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
