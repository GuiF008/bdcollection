"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, LayoutGrid, Search, Table2, X, CheckSquare, Square } from "lucide-react";
import { OwnershipStatus } from "@/generated/prisma/enums";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import type { CollectionItemWithRef, SeriesRefForCollection } from "@/lib/domain/types";
import SeriesReferenceInlineEdit from "@/components/collection/SeriesReferenceInlineEdit";
import { bulkCollectionStatusAction, type BulkCollectionMode } from "@/app/actions/references";

const STORAGE_KEY = "bdcollection:collectionAlbumView";

type AlbumViewMode = "list" | "cards";

interface Props {
  series: SeriesRefForCollection;
  items: CollectionItemWithRef[];
  initialDupOnly?: boolean;
  initialEoOnly?: boolean;
}

function displaySeriesAuthors(series: SeriesRefForCollection, groupItems: CollectionItemWithRef[]) {
  if (series.authors?.trim()) return series.authors;
  const set = new Set<string>();
  for (const it of groupItems) {
    const a = it.albumReference.authors?.trim();
    if (a) set.add(a);
  }
  return set.size ? [...set].join(" · ") : null;
}

function displaySeriesPublisher(series: SeriesRefForCollection, groupItems: CollectionItemWithRef[]) {
  if (series.publisher?.trim()) return series.publisher;
  const set = new Set<string>();
  for (const it of groupItems) {
    const p = it.albumReference.publisher?.trim();
    if (p) set.add(p);
  }
  return set.size ? [...set].join(" · ") : null;
}

export default function CollectionSeriesDetailClient({
  series,
  items,
  initialDupOnly = false,
  initialEoOnly = false,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [eoOnly, setEoOnly] = useState(initialEoOnly);
  const [toVerify, setToVerify] = useState(false);
  const [dupOnly, setDupOnly] = useState(initialDupOnly);
  const [huntOnly, setHuntOnly] = useState(false);
  /** Faux par défaut : afficher aussi les albums seulement « suivis » (statut à affiner). */
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();
  const [albumView, setAlbumView] = useState<AlbumViewMode>("list");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as AlbumViewMode | null;
      if (v === "list" || v === "cards") setAlbumView(v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, albumView);
    } catch {
      /* ignore */
    }
  }, [albumView]);

  const norm = (t: string) =>
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    let r = [...items];
    if (ownedOnly) {
      r = r.filter((it) => it.ownershipStatus === OwnershipStatus.OWNED);
    }
    if (search) {
      const term = norm(search);
      r = r.filter(
        (it) =>
          norm(it.albumReference.title).includes(term) ||
          norm(it.albumReference.authors || "").includes(term) ||
          norm(it.notes || "").includes(term)
      );
    }
    if (eoOnly) {
      r = r.filter((it) => it.editionStatus === "FIRST_EDITION");
    }
    if (toVerify) {
      r = r.filter(
        (it) => it.editionConfidence === "TO_VERIFY" || it.editionConfidence === "PROBABLE"
      );
    }
    if (dupOnly) r = r.filter((it) => it.isDuplicate);
    if (huntOnly) {
      r = r.filter(
        (it) =>
          it.ownershipStatus === "WANTED" ||
          it.ownershipStatus === "HUNTING" ||
          it.searchStatus === "WANTED" ||
          it.searchStatus === "HUNTING"
      );
    }
    return r.sort((a, b) => {
      const va = a.albumReference.volumeNumber ?? 99999;
      const vb = b.albumReference.volumeNumber ?? 99999;
      if (va !== vb) return va - vb;
      return a.albumReference.title.localeCompare(b.albumReference.title, "fr");
    });
  }, [items, ownedOnly, search, eoOnly, toVerify, dupOnly, huntOnly]);

  const authorsLine = displaySeriesAuthors(series, items);
  const publisherLine = displaySeriesPublisher(series, items);
  const cover = series.coverImageUrl ?? items[0]?.albumReference.coverImageUrl;

  function toggleAlbum(albumRefId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(albumRefId)) next.delete(albumRefId);
      else next.add(albumRefId);
      return next;
    });
  }

  function selectAllVisible(checked: boolean) {
    const ids = filtered.map((it) => it.albumReference.id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function allVisibleSelected() {
    if (filtered.length === 0) return false;
    return filtered.every((it) => selected.has(it.albumReference.id));
  }

  function runBulk(mode: BulkCollectionMode) {
    const ids = Array.from(selected);
    startBulk(async () => {
      await bulkCollectionStatusAction(ids, mode);
      setSelected(new Set());
      router.refresh();
    });
  }

  function statusBadges(it: CollectionItemWithRef) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {it.ownershipStatus === "OWNED" && <Badge variant="success">Dans ma collection</Badge>}
        {it.ownershipStatus === "NOT_OWNED" && <Badge variant="default">Suivi</Badge>}
        {it.ownershipStatus === "WANTED" && <Badge variant="default">Recherché</Badge>}
        {it.ownershipStatus === "HUNTING" && <Badge variant="warning">À chasser</Badge>}
        {it.editionStatus === "FIRST_EDITION" && <Badge variant="primary">Première édition</Badge>}
        {(it.editionConfidence === "TO_VERIFY" || it.editionConfidence === "PROBABLE") && (
          <Badge variant="warning">À vérifier</Badge>
        )}
        {it.isDuplicate && <Badge variant="warning">Doublon</Badge>}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/collection"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Toutes les séries
      </Link>

      <section className="rounded-xl border border-border bg-white overflow-hidden mb-6">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-alt/40">
          <div className="flex flex-col sm:flex-row gap-5">
            <CoverImage src={cover} alt={series.title} size="lg" className="shrink-0 mx-auto sm:mx-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">{series.title}</h1>
                  <Link
                    href={`/catalog/${series.id}`}
                    className="text-xs text-primary font-medium hover:underline mt-1 inline-block"
                  >
                    Catalogue importé
                  </Link>
                </div>
              </div>
              {authorsLine && (
                <p className="text-sm text-text-secondary mt-3">
                  <span className="text-text-muted">Auteur(s) : </span>
                  {authorsLine}
                </p>
              )}
              {publisherLine && (
                <p className="text-sm text-text-secondary mt-1">
                  <span className="text-text-muted">Éditeur : </span>
                  {publisherLine}
                </p>
              )}
              {series.universe?.trim() && (
                <p className="text-sm text-text-secondary mt-1">
                  <span className="text-text-muted">Univers : </span>
                  {series.universe}
                </p>
              )}
              {series.summary?.trim() && (
                <div className="mt-3 pt-3 border-t border-border/80">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Résumé</p>
                  <p className="text-sm text-text-secondary whitespace-pre-line">{series.summary}</p>
                </div>
              )}
              <SeriesReferenceInlineEdit series={series} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-3 mb-4 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans cette série…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface-alt/50">
            <button
              type="button"
              onClick={() => setAlbumView("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium ${
                albumView === "list"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              Liste
            </button>
            <button
              type="button"
              onClick={() => setAlbumView("cards")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium ${
                albumView === "cards"
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cartes
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-white space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-primary">Affiner</span>
            <button type="button" onClick={() => setFilterOpen(false)} className="p-1 text-text-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} />
              Uniquement albums possédés
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={eoOnly} onChange={(e) => setEoOnly(e.target.checked)} />
              Première édition
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={toVerify} onChange={(e) => setToVerify(e.target.checked)} />
              EO à vérifier
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={dupOnly} onChange={(e) => setDupOnly(e.target.checked)} />
              Doublons
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={huntOnly} onChange={(e) => setHuntOnly(e.target.checked)} />
              À chasser / recherchés
            </label>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-primary/25 bg-primary/5">
          <p className="text-sm font-medium text-text-primary">
            {selected.size} album{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
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
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">Aucun résultat avec ces filtres.</p>
      ) : albumView === "list" ? (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-alt/30">
            <button
              type="button"
              onClick={() => selectAllVisible(!allVisibleSelected())}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {allVisibleSelected() ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allVisibleSelected() ? "Tout désélectionner (liste)" : "Tout sélectionner (liste)"}
            </button>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((it) => (
              <li key={it.id} className="flex items-stretch gap-0">
                <label className="flex items-center px-3 sm:px-4 cursor-pointer border-r border-border bg-surface-alt/20 hover:bg-surface-alt/40">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.has(it.albumReference.id)}
                    onChange={() => toggleAlbum(it.albumReference.id)}
                  />
                </label>
                <Link
                  href={`/albums/${it.albumReference.id}`}
                  className="flex flex-1 items-center gap-4 p-4 min-w-0 hover:bg-surface-alt/30 transition-colors"
                >
                  <CoverImage
                    src={it.albumReference.coverImageUrl}
                    alt={it.albumReference.title}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {it.albumReference.volumeNumber != null && (
                        <span className="text-xs font-bold text-primary">T.{it.albumReference.volumeNumber}</span>
                      )}
                      <p className="text-sm font-medium text-text-primary truncate">{it.albumReference.title}</p>
                    </div>
                    {it.albumReference.authors && (
                      <p className="text-xs text-text-muted truncate mt-0.5">{it.albumReference.authors}</p>
                    )}
                    <div className="mt-2">{statusBadges(it)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => selectAllVisible(!allVisibleSelected())}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary"
            >
              {allVisibleSelected() ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allVisibleSelected() ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((it) => (
              <div
                key={it.id}
                className="relative rounded-xl border border-border bg-white overflow-hidden hover:border-primary/25 transition-colors"
              >
                <label className="absolute top-2 left-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/90 border border-border shadow-sm">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.has(it.albumReference.id)}
                    onChange={() => toggleAlbum(it.albumReference.id)}
                  />
                </label>
                <Link href={`/albums/${it.albumReference.id}`} className="block p-3 pt-11">
                  <div className="flex justify-center mb-2">
                    <CoverImage
                      src={it.albumReference.coverImageUrl}
                      alt={it.albumReference.title}
                      size="md"
                    />
                  </div>
                  {it.albumReference.volumeNumber != null && (
                    <span className="text-xs font-bold text-primary">T.{it.albumReference.volumeNumber}</span>
                  )}
                  <p className="text-sm font-medium text-text-primary line-clamp-2 mt-1">{it.albumReference.title}</p>
                  <div className="mt-2">{statusBadges(it)}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
