"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, BookOpen, Library } from "lucide-react";
import Link from "next/link";

interface SearchResultItem {
  type: "album" | "series";
  id: string;
  title: string;
  subtitle: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const doSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();

      const items: SearchResultItem[] = [
        ...(data.series || []).map(
          (s: { id: string; title: string; _count?: { albums: number } }) => ({
            type: "series" as const,
            id: s.id,
            title: s.title,
            subtitle: `Série — ${s._count?.albums || 0} album(s)`,
          })
        ),
        ...(data.albums || []).map(
          (a: { id: string; title: string; series?: { title: string }; author?: string }) => ({
            type: "album" as const,
            id: a.id,
            title: a.title,
            subtitle: [a.series?.title, a.author].filter(Boolean).join(" — "),
          })
        ),
      ];

      setResults(items);
      setIsOpen(items.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un album, une série, un auteur..."
          className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg border border-border shadow-lg max-h-80 overflow-y-auto z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-text-muted">
              Recherche en cours...
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={
                  item.type === "album"
                    ? `/albums/${item.id}`
                    : `/catalog/${item.id}`
                }
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors border-b border-border last:border-0"
              >
                {item.type === "album" ? (
                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                ) : (
                  <Library className="h-4 w-4 text-secondary flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
