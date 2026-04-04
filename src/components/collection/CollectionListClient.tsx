"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import { OwnershipStatus } from "@/generated/prisma/enums";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import type { CollectionItemWithRef } from "@/lib/domain/types";

interface Props {
  items: CollectionItemWithRef[];
  seriesOptions: { id: string; title: string }[];
}

export default function CollectionListClient({ items, seriesOptions }: Props) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [seriesId, setSeriesId] = useState("");
  const [eoOnly, setEoOnly] = useState(false);
  const [toVerify, setToVerify] = useState(false);
  const [dupOnly, setDupOnly] = useState(false);
  const [huntOnly, setHuntOnly] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(true);

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
          norm(it.albumReference.seriesReference.title).includes(term) ||
          norm(it.notes || "").includes(term)
      );
    }
    if (seriesId) {
      r = r.filter((it) => it.albumReference.seriesReference.id === seriesId);
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
    return r;
  }, [items, ownedOnly, search, seriesId, eoOnly, toVerify, dupOnly, huntOnly]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans ma collection…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
        >
          <Filter className="h-4 w-4" />
          Filtres
        </button>
      </div>

      {filterOpen && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-white space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-primary">Affiner</span>
            <button type="button" onClick={() => setFilterOpen(false)} className="p-1 text-text-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Série (catalogue)</label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                {seriesOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
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

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">Aucun résultat avec ces filtres.</p>
        ) : (
          filtered.map((it) => (
            <Link
              key={it.id}
              href={`/albums/${it.albumReference.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:bg-surface-alt/50 transition-colors"
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
                  <p className="text-sm font-medium text-text-primary truncate">
                    {it.albumReference.title}
                  </p>
                </div>
                <p className="text-xs text-text-muted truncate">
                  {it.albumReference.seriesReference.title}
                  {it.albumReference.authors && ` — ${it.albumReference.authors}`}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {it.ownershipStatus === "OWNED" && <Badge variant="success">Dans ma collection</Badge>}
                  {it.editionStatus === "FIRST_EDITION" && <Badge variant="primary">Première édition</Badge>}
                  {(it.editionConfidence === "TO_VERIFY" || it.editionConfidence === "PROBABLE") && (
                    <Badge variant="warning">À vérifier</Badge>
                  )}
                  {it.isDuplicate && <Badge variant="warning">Doublon</Badge>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
