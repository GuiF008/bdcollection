"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";

export default function RefreshCatalogSeriesButton({ seriesId }: { seriesId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scraping/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "Échec du rafraîchissement.");
        return;
      }
      router.refresh();
      setMessage("Cache mis à jour.");
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface-alt disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {loading ? "Rafraîchissement…" : "Rafraîchir depuis Bedetheque"}
      </button>
      {message && <p className="text-xs text-text-secondary">{message}</p>}
    </div>
  );
}
