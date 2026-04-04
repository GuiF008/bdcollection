"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";

const EXAMPLE_URL = "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html";

type ImportSuccessPayload = {
  fromCache: boolean;
  stale?: boolean;
  series?: {
    id: string;
    title?: string;
    albumCount?: number;
    isStale?: boolean;
    albums?: unknown[];
  };
  message?: string;
  jobId?: string;
  status?: string;
  warnings?: string[];
};

type ImportResponse =
  | ImportSuccessPayload
  | { error: string; details?: unknown }
  | {
      jobId: string;
      status: string;
      errorMessage: string | null;
      warnings?: string[];
    };

function isErrorPayload(j: ImportResponse): j is { error: string } {
  return typeof j === "object" && j !== null && "error" in j && typeof (j as { error: string }).error === "string";
}

function isFailedJob(j: ImportResponse): j is {
  jobId: string;
  status: string;
  errorMessage: string | null;
  warnings?: string[];
} {
  return (
    typeof j === "object" &&
    j !== null &&
    "status" in j &&
    "errorMessage" in j &&
    (j as { status: string }).status === "failed"
  );
}

function isSuccessPayload(j: ImportResponse): j is ImportSuccessPayload {
  return typeof j === "object" && j !== null && "fromCache" in j;
}

export default function BedethequeCatalogImport() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<ImportResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPayload(null);

    try {
      const res = await fetch("/api/scraping/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "bedetheque", url: url.trim() }),
      });

      const json = (await res.json()) as ImportResponse;
      setPayload(json);
    } catch {
      setPayload({ error: "Réseau ou serveur injoignable." });
    } finally {
      setLoading(false);
    }
  };

  const seriesBlock =
    payload && isSuccessPayload(payload) && !isFailedJob(payload) && payload.series?.id
      ? payload.series
      : null;

  const albumCount =
    seriesBlock && Array.isArray(seriesBlock.albums)
      ? seriesBlock.albums.length
      : seriesBlock?.albumCount ?? null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Collez l’URL d’une page série Bedetheque (pas une fiche album seule). Les données alimentent
        le catalogue importé (référentiel). Ce n’est pas une possession : ajoutez ensuite les albums
        à votre collection depuis la fiche série. Si la série est déjà en cache, rien n’est re-téléchargé
        tant que vous n’utilisez pas « Rafraîchir » sur la page de détail.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="bedetheque-url" className="sr-only">
            URL série Bedetheque
          </label>
          <input
            id="bedetheque-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={EXAMPLE_URL}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Exemple : <span className="font-mono break-all">{EXAMPLE_URL}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {loading ? "Import en cours…" : "Importer dans le cache catalogue"}
        </button>
      </form>

      {payload && isErrorPayload(payload) && (
        <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-danger/10 text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{payload.error}</span>
        </div>
      )}

      {payload && isFailedJob(payload) && "errorMessage" in payload && (
        <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-danger/10 text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Import échoué</p>
            {payload.errorMessage && <p className="mt-1">{payload.errorMessage}</p>}
            {payload.warnings && payload.warnings.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs opacity-90">
                {payload.warnings.slice(0, 8).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {payload && isSuccessPayload(payload) && !isFailedJob(payload) && seriesBlock && (
          <div className="rounded-lg border border-border bg-surface-alt/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <span className="font-medium text-text-primary">
                {payload.fromCache ? "Série lue depuis le cache" : "Série importée"}
              </span>
              {(seriesBlock.isStale ?? payload.stale) && (
                <Badge variant="warning">Cache à rafraîchir</Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              <span className="text-text-primary font-medium">{seriesBlock.title ?? "Sans titre"}</span>
              {albumCount != null && (
                <>
                  {" "}
                  — {albumCount} album{albumCount > 1 ? "s" : ""} en cache
                </>
              )}
            </p>
            {payload.message && payload.fromCache && (
              <p className="text-xs text-text-muted">{payload.message}</p>
            )}
            {payload.warnings && payload.warnings.length > 0 && (
                <div className="text-xs text-warning">
                  <p className="font-medium">Avertissements</p>
                  <ul className="mt-1 list-disc list-inside max-h-32 overflow-y-auto">
                    {payload.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/catalog/${seriesBlock.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Voir le cache de cette série
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
    </div>
  );
}
