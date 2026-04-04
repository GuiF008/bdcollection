"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateAlbumReferenceAction } from "@/app/actions/references";
import type { AlbumReference } from "@/generated/prisma/client";

type Props = {
  album: AlbumReference;
};

export default function AlbumReferenceEditForm({ album }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateAlbumReferenceAction(album.id, fd);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-primary hover:underline"
      >
        {open ? "Fermer" : "Modifier les informations de référence (album)"}
      </button>
      {open && (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-muted mb-1">Titre</label>
              <input
                name="title"
                required
                defaultValue={album.title}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-muted mb-1">Sous-titre</label>
              <input
                name="subtitle"
                defaultValue={album.subtitle ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Auteur(s)</label>
              <input
                name="authors"
                defaultValue={album.authors ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Éditeur</label>
              <input
                name="publisher"
                defaultValue={album.publisher ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Tome (numéro)</label>
              <input
                name="volumeNumber"
                type="number"
                defaultValue={album.volumeNumber ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Libellé tome</label>
              <input
                name="volumeLabel"
                defaultValue={album.volumeLabel ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Date de parution</label>
              <input
                name="publicationDate"
                type="date"
                defaultValue={
                  album.publicationDate
                    ? new Date(album.publicationDate).toISOString().slice(0, 10)
                    : ""
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">ISBN</label>
              <input
                name="isbn"
                defaultValue={album.isbn ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-muted mb-1">Libellé édition</label>
              <input
                name="editionLabel"
                defaultValue={album.editionLabel ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-muted mb-1">URL couverture</label>
              <input
                name="coverImageUrl"
                type="url"
                defaultValue={album.coverImageUrl ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-muted mb-1">Résumé</label>
              <textarea
                name="summary"
                rows={4}
                defaultValue={album.summary ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer la fiche album"}
          </button>
        </form>
      )}
    </div>
  );
}
