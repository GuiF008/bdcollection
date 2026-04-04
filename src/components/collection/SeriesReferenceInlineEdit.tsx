"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSeriesReferenceAction } from "@/app/actions/references";
import type { SeriesRefForCollection } from "@/lib/domain/types";

type Props = {
  series: SeriesRefForCollection;
};

export default function SeriesReferenceInlineEdit({ series }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateSeriesReferenceAction(series.id, fd);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-primary hover:underline"
      >
        {open ? "Fermer l’édition" : "Modifier la fiche série"}
      </button>
      {open && (
        <form onSubmit={onSubmit} className="mt-3 space-y-3 p-4 rounded-lg border border-border bg-surface-alt/30">
          <p className="text-xs text-text-muted">
            Ces champs décrivent la série dans son ensemble (comme l’ancienne vue « série »).
          </p>
          <div>
            <label className="block text-xs text-text-muted mb-1">Titre</label>
            <input
              name="title"
              required
              defaultValue={series.title}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Résumé</label>
            <textarea
              name="summary"
              rows={3}
              defaultValue={series.summary ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Univers</label>
            <input
              name="universe"
              defaultValue={series.universe ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Auteur(s) (série)</label>
              <input
                name="authors"
                defaultValue={series.authors ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Maison d’édition (série)</label>
              <input
                name="publisher"
                defaultValue={series.publisher ?? ""}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">URL couverture série</label>
            <input
              name="coverImageUrl"
              type="url"
              defaultValue={series.coverImageUrl ?? ""}
              className="w-full rounded-lg border border-border px-3 py-2 text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer la série"}
          </button>
        </form>
      )}
    </div>
  );
}
