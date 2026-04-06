"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCollectionGroupAction,
  deleteCollectionGroupAction,
  renameCollectionGroupAction,
} from "@/app/actions/collectionGroups";

type Row = {
  id: string;
  name: string;
  _count: { memberships: number };
};

export default function CollectionGroupsManagerClient({ initialGroups }: { initialGroups: Row[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function create(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    start(async () => {
      await createCollectionGroupAction(n);
      setName("");
      router.refresh();
    });
  }

  function saveRename(id: string) {
    start(async () => {
      await renameCollectionGroupAction(id, editName);
      setEditingId(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce groupe ? Les séries ne sont pas supprimées.")) return;
    start(async () => {
      await deleteCollectionGroupAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-text-muted mb-1">Nouveau groupe</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. À compléter, EO confirmées…"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          Créer
        </button>
      </form>

      {initialGroups.length === 0 ? (
        <p className="text-sm text-text-muted">Aucun groupe. Créez-en un pour l’assigner aux séries.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-white overflow-hidden">
          {initialGroups.map((g) => (
            <li key={g.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
              {editingId === g.id ? (
                <div className="flex flex-wrap gap-2 flex-1 items-center">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 min-w-[160px] rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => saveRename(g.id)}
                    className="text-xs font-medium text-primary"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-text-muted"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary">{g.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {g._count.memberships} série{g._count.memberships > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(g.id);
                        setEditName(g.name);
                      }}
                      className="text-xs font-medium px-2 py-1 rounded-md border border-border hover:bg-surface-alt"
                    >
                      Renommer
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(g.id)}
                      className="text-xs font-medium px-2 py-1 rounded-md text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
