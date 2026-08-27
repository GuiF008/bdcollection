"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, CheckCircle2, Loader2 } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import Badge from "@/components/ui/Badge";
import { addOwnedAlbumAction } from "@/app/actions/collection";

interface AlbumResult {
  id: string;
  title: string;
  volumeNumber: number | null;
  volumeLabel: string | null;
  coverImageUrl: string | null;
  authors: string | null;
  publisher: string | null;
  seriesReference: { id: string; title: string } | null;
  collectionItems?: { ownershipStatus: string }[];
}

export default function AddAlbumSearchClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AlbumResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.albums || []);
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
    inputRef.current?.focus();
  };

  function handleAdd(albumId: string) {
    setPendingId(albumId);
    startTransition(async () => {
      await addOwnedAlbumAction(albumId);
      setAddedIds((prev) => new Set(prev).add(albumId));
      setPendingId(null);
      router.refresh();
    });
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Rechercher par titre, série, auteur..."
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Recherche en cours...
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-sm text-text-muted py-4">
          Aucun album trouvé. Importez une série depuis la page{" "}
          <a href="/import-export" className="text-primary font-medium hover:underline">
            Import / Export
          </a>
          .
        </p>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-white overflow-hidden divide-y divide-border">
          {results.map((album) => {
            const isAdded = addedIds.has(album.id);
            const isAlreadyOwned = album.collectionItems?.some(
              (c) => c.ownershipStatus === "OWNED"
            );
            const owned = isAdded || isAlreadyOwned;
            const isAddingThis = pending && pendingId === album.id;

            return (
              <div
                key={album.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <CoverImage src={album.coverImageUrl} alt={album.title} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {album.volumeNumber != null && `T${album.volumeNumber} · `}
                    {album.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {[album.seriesReference?.title, album.authors].filter(Boolean).join(" — ")}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {owned ? (
                    <Badge variant="success">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Possédé
                      </span>
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleAdd(album.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-50"
                    >
                      {isAddingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Ajouter à ma collection"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
