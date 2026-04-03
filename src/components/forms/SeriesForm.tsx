"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSeriesAction, updateSeriesAction } from "@/app/actions/series";
import type { SeriesWithCount } from "@/lib/domain/types";

interface SeriesFormProps {
  series?: SeriesWithCount | null;
}

export default function SeriesForm({ series }: SeriesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!series;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      if (isEditing) {
        formData.set("id", series!.id);
        await updateSeriesAction(formData);
        router.push(`/series/${series!.id}`);
      } else {
        const result = await createSeriesAction(formData);
        router.push(`/series/${result.id}`);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border">
      <div className="p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">
            Nom de la série *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={series?.title || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Ex : Tintin, Astérix, Blake et Mortimer..."
          />
        </div>

        <div>
          <label htmlFor="authors" className="block text-sm font-medium text-text-primary mb-1.5">
            Auteur(s)
          </label>
          <input
            id="authors"
            name="authors"
            type="text"
            defaultValue={series?.authors || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Ex : Hergé"
          />
        </div>

        <div>
          <label htmlFor="publisher" className="block text-sm font-medium text-text-primary mb-1.5">
            Maison d&apos;édition
          </label>
          <input
            id="publisher"
            name="publisher"
            type="text"
            defaultValue={series?.publisher || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Ex : Casterman"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={series?.description || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            placeholder="Description de la série..."
          />
        </div>

        <div>
          <label htmlFor="personalNotes" className="block text-sm font-medium text-text-primary mb-1.5">
            Notes personnelles
          </label>
          <textarea
            id="personalNotes"
            name="personalNotes"
            rows={2}
            defaultValue={series?.personalNotes || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            placeholder="Vos notes..."
          />
        </div>

        <div>
          <label htmlFor="cover" className="block text-sm font-medium text-text-primary mb-1.5">
            Image de couverture
          </label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-text-secondary rounded-lg border border-border hover:bg-surface-alt transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
              ? "Mettre à jour"
              : "Créer la série"}
        </button>
      </div>
    </form>
  );
}
