"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function ImportForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      setResult({ success: false, message: "Veuillez sélectionner un fichier." });
      setLoading(false);
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: `Import réussi : ${json.albumsCreated} album(s) importé(s), ${json.seriesCreated} série(s) créée(s).`,
        });
      } else {
        setResult({
          success: false,
          message: json.error || "Erreur lors de l'import.",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Fichier invalide. Vérifiez le format JSON.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="file"
        type="file"
        accept=".json"
        className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {loading ? "Import en cours..." : "Importer"}
      </button>

      {result && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            result.success
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          {result.message}
        </div>
      )}
    </form>
  );
}
