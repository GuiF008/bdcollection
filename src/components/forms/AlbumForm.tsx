"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAlbumAction, updateAlbumAction } from "@/app/actions/albums";
import type { AlbumWithSeries } from "@/lib/domain/types";

interface AlbumFormProps {
  album?: AlbumWithSeries | null;
  seriesList: { id: string; title: string }[];
  defaultSeriesId?: string;
}

export default function AlbumForm({
  album,
  seriesList,
  defaultSeriesId,
}: AlbumFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!album;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      if (isEditing) {
        formData.set("id", album!.id);
        await updateAlbumAction(formData);
        router.push(`/albums/${album!.id}`);
      } else {
        const result = await createAlbumAction(formData);
        router.push(`/albums/${result.id}`);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
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
          <label htmlFor="seriesId" className="block text-sm font-medium text-text-primary mb-1.5">
            Série / Collection *
          </label>
          <select
            id="seriesId"
            name="seriesId"
            required
            defaultValue={album?.seriesId || defaultSeriesId || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
          >
            <option value="">Sélectionnez une série</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">
              Titre *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={album?.title || ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Titre de l'album"
            />
          </div>

          <div>
            <label htmlFor="volumeNumber" className="block text-sm font-medium text-text-primary mb-1.5">
              Numéro / Tome
            </label>
            <input
              id="volumeNumber"
              name="volumeNumber"
              type="number"
              min="0"
              defaultValue={album?.volumeNumber ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Ex : 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-text-primary mb-1.5">
              Auteur
            </label>
            <input
              id="author"
              name="author"
              type="text"
              defaultValue={album?.author || ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Auteur de l'album"
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
              defaultValue={album?.publisher || ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Éditeur"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="publicationDate" className="block text-sm font-medium text-text-primary mb-1.5">
              Date de parution
            </label>
            <input
              id="publicationDate"
              name="publicationDate"
              type="date"
              defaultValue={formatDate(album?.publicationDate)}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                name="isOriginalEdition"
                type="checkbox"
                value="true"
                defaultChecked={album?.isOriginalEdition || false}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm font-medium text-text-primary">
                Édition originale
              </span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-text-primary mb-1.5">
            Résumé
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            defaultValue={album?.summary || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            placeholder="Résumé de l'album..."
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
            defaultValue={album?.personalNotes || ""}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            placeholder="Vos notes..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-text-primary mb-1.5">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              defaultValue={album?.isbn || ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="978-..."
            />
          </div>

          <div>
            <label htmlFor="ean" className="block text-sm font-medium text-text-primary mb-1.5">
              EAN
            </label>
            <input
              id="ean"
              name="ean"
              type="text"
              defaultValue={album?.ean || ""}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Code EAN"
            />
          </div>
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
              : "Ajouter l'album"}
        </button>
      </div>
    </form>
  );
}
