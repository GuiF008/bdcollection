"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addOwnedAlbumAction,
  markHuntingAlbumAction,
  markWantedAlbumAction,
} from "@/app/actions/collection";

export default function InitCollectionPanel({ albumReferenceId }: { albumReferenceId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-alt/30 p-6 text-center">
      <p className="text-sm text-text-secondary mb-4">
        Aucune fiche de collection pour cet album du catalogue. Créez-en une pour suivre votre exemplaire.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await addOwnedAlbumAction(albumReferenceId);
              router.refresh();
            })
          }
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          J’ai cet album
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await markWantedAlbumAction(albumReferenceId);
              router.refresh();
            })
          }
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary"
        >
          Je le recherche
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await markHuntingAlbumAction(albumReferenceId);
              router.refresh();
            })
          }
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary"
        >
          Je le chasse
        </button>
      </div>
    </div>
  );
}
