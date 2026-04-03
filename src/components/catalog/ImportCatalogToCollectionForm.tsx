"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Library, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { importCatalogToCollectionAction } from "@/app/actions/catalogImport";
import type { ImportCatalogMode } from "@/lib/services/catalogToCollection";

type SeriesOption = { id: string; title: string };

export default function ImportCatalogToCollectionForm({
  catalogSeriesId,
  seriesOptions,
}: {
  catalogSeriesId: string;
  seriesOptions: SeriesOption[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ImportCatalogMode>("new_series");
  const [collectionSeriesId, setCollectionSeriesId] = useState<string>(
    seriesOptions[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
    collectionSeriesId?: string;
    created?: number;
    skipped?: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await importCatalogToCollectionAction({
      catalogSeriesId,
      mode,
      collectionSeriesId: mode === "existing_series" ? collectionSeriesId : null,
    });

    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "err", text: res.error });
      return;
    }

    setMessage({
      type: "ok",
      text: "",
      collectionSeriesId: res.collectionSeriesId,
      created: res.albumsCreated,
      skipped: res.albumsSkipped,
    });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold text-text-primary">
          Importer dans ma collection
        </h2>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Les albums du cache sont copiés en albums de votre collection. Les doublons
        (même source Bedetheque ou même ISBN dans la série) sont ignorés.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-primary sr-only">Destination</legend>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="dest"
              checked={mode === "new_series"}
              onChange={() => setMode("new_series")}
              className="mt-1"
            />
            <span className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Nouvelle série</span> — crée une
              série avec le titre et le résumé du cache, puis ajoute les albums.
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="dest"
              checked={mode === "existing_series"}
              onChange={() => setMode("existing_series")}
              className="mt-1"
            />
            <span className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Série existante</span> — ajoute les
              albums à une série déjà présente.
            </span>
          </label>
        </fieldset>

        {mode === "existing_series" && (
          <div>
            <label htmlFor="collection-series" className="block text-sm font-medium text-text-primary mb-1.5">
              Série de destination
            </label>
            <select
              id="collection-series"
              required
              value={collectionSeriesId}
              onChange={(e) => setCollectionSeriesId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary"
            >
              {seriesOptions.length === 0 ? (
                <option value="">Aucune série — créez-en une d&apos;abord</option>
              ) : (
                seriesOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (mode === "existing_series" && (seriesOptions.length === 0 || !collectionSeriesId))
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Library className="h-4 w-4" />}
          {loading ? "Import…" : "Importer dans ma collection"}
        </button>
      </form>

      {message?.type === "err" && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg text-sm bg-danger/10 text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {message.text}
        </div>
      )}

      {message?.type === "ok" && message.collectionSeriesId != null && (() => {
        const created = message.created ?? 0;
        const skipped = message.skipped ?? 0;
        return (
        <div className="mt-4 flex flex-col gap-2 p-3 rounded-lg text-sm bg-success/10 text-success">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-text-primary">
                {created === 0
                  ? "Aucun nouvel album"
                  : `${created} album${created > 1 ? "s" : ""} créé${created > 1 ? "s" : ""}`}
                {skipped > 0
                  ? ` — ${skipped} déjà présent${skipped > 1 ? "s" : ""} (ignoré${skipped > 1 ? "s" : ""})`
                  : ""}
                .
              </p>
              <Link
                href={`/series/${message.collectionSeriesId}`}
                className="inline-block mt-2 text-primary font-medium hover:underline"
              >
                Ouvrir la série dans ma collection
              </Link>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
