"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import type { AlbumWithSeries, SortField, SortOrder } from "@/lib/domain/types";

interface AlbumListClientProps {
  albums: AlbumWithSeries[];
  authors: string[];
  publishers: string[];
  seriesList: { id: string; title: string }[];
}

const sortOptions: { label: string; field: SortField; order: SortOrder }[] = [
  { label: "Titre A-Z", field: "title", order: "asc" },
  { label: "Titre Z-A", field: "title", order: "desc" },
  { label: "Auteur A-Z", field: "author", order: "asc" },
  { label: "Éditeur A-Z", field: "publisher", order: "asc" },
  { label: "Date de parution ↑", field: "publicationDate", order: "asc" },
  { label: "Date de parution ↓", field: "publicationDate", order: "desc" },
  { label: "Date d'ajout ↓", field: "createdAt", order: "desc" },
  { label: "Tome ↑", field: "volumeNumber", order: "asc" },
];

export default function AlbumListClient({
  albums,
  authors,
  publishers,
  seriesList,
}: AlbumListClientProps) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [originalOnly, setOriginalOnly] = useState(false);
  const [coverOnly, setCoverOnly] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    let result = [...albums];

    if (search) {
      const term = normalize(search);
      result = result.filter(
        (a) =>
          normalize(a.title).includes(term) ||
          normalize(a.author || "").includes(term) ||
          normalize(a.publisher || "").includes(term) ||
          normalize(a.series.title).includes(term)
      );
    }

    if (selectedSeries) result = result.filter((a) => a.seriesId === selectedSeries);
    if (selectedAuthor) result = result.filter((a) => a.author === selectedAuthor);
    if (selectedPublisher) result = result.filter((a) => a.publisher === selectedPublisher);
    if (originalOnly) result = result.filter((a) => a.isOriginalEdition);
    if (coverOnly) result = result.filter((a) => a.coverImageUrl);

    const sort = sortOptions[sortIndex];
    result.sort((a, b) => {
      const aVal = a[sort.field as keyof typeof a];
      const bVal = b[sort.field as keyof typeof b];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.order === "asc" ? cmp : -cmp;
    });

    return result;
  }, [albums, search, selectedSeries, selectedAuthor, selectedPublisher, originalOnly, coverOnly, sortIndex]);

  const hasActiveFilters = selectedSeries || selectedAuthor || selectedPublisher || originalOnly || coverOnly;

  const clearFilters = () => {
    setSelectedSeries("");
    setSelectedAuthor("");
    setSelectedPublisher("");
    setOriginalOnly(false);
    setCoverOnly(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un album..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-text-secondary hover:bg-surface-alt"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                {[selectedSeries, selectedAuthor, selectedPublisher, originalOnly, coverOnly].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sortIndex}
              onChange={(e) => setSortIndex(Number(e.target.value))}
              className="appearance-none px-3 pr-8 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary bg-white hover:bg-surface-alt transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map((opt, i) => (
                <option key={i} value={i}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Série</label>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Toutes</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Auteur</label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous</option>
              {authors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Éditeur</label>
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous</option>
              {publishers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={originalOnly}
                onChange={(e) => setOriginalOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-primary">Éditions originales</span>
            </label>
          </div>
          <div className="flex items-end justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={coverOnly}
                onChange={(e) => setCoverOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-primary">Avec couverture</span>
            </label>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-text-muted mb-3">
        {filtered.length} album{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/50">
                <th className="text-left py-3 px-4 font-medium text-text-muted w-14"></th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Titre</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted hidden md:table-cell">Série</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted hidden lg:table-cell">Auteur</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted hidden lg:table-cell">Éditeur</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted hidden xl:table-cell">Tome</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted w-16">EO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((album) => (
                <tr
                  key={album.id}
                  className="hover:bg-surface-alt/50 transition-colors"
                >
                  <td className="py-2 px-4">
                    <CoverImage src={album.coverImageUrl} alt={album.title} size="sm" />
                  </td>
                  <td className="py-2 px-4">
                    <Link
                      href={`/albums/${album.id}`}
                      className="font-medium text-text-primary hover:text-primary transition-colors"
                    >
                      {album.title}
                    </Link>
                    <p className="text-xs text-text-muted md:hidden mt-0.5">
                      {album.series.title}
                    </p>
                  </td>
                  <td className="py-2 px-4 hidden md:table-cell">
                    <Link
                      href={`/series/${album.seriesId}`}
                      className="text-text-secondary hover:text-primary transition-colors"
                    >
                      {album.series.title}
                    </Link>
                  </td>
                  <td className="py-2 px-4 text-text-secondary hidden lg:table-cell">
                    {album.author || "—"}
                  </td>
                  <td className="py-2 px-4 text-text-secondary hidden lg:table-cell">
                    {album.publisher || "—"}
                  </td>
                  <td className="py-2 px-4 text-text-secondary hidden xl:table-cell">
                    {album.volumeNumber ?? "—"}
                  </td>
                  <td className="py-2 px-4">
                    {album.isOriginalEdition && <Badge variant="success">EO</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm">
            Aucun album ne correspond à vos critères.
          </div>
        )}
      </div>
    </div>
  );
}
