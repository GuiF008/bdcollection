"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addOwnedAlbumAction,
  markHuntingAlbumAction,
  markWantedAlbumAction,
} from "@/app/actions/collection";

export default function CatalogAlbumQuickActions({
  albumReferenceId,
  hasOwned,
}: {
  albumReferenceId: string;
  hasOwned: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending || hasOwned}
        onClick={() =>
          start(async () => {
            await addOwnedAlbumAction(albumReferenceId);
            router.refresh();
          })
        }
        className="text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-40"
      >
        Dans ma collection
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
        className="text-xs px-2 py-1 rounded-md border border-border text-text-secondary"
      >
        Recherché
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
        className="text-xs px-2 py-1 rounded-md border border-border text-text-secondary"
      >
        À chasser
      </button>
      <a
        href={`/albums/${albumReferenceId}`}
        className="text-xs px-2 py-1 rounded-md border border-border text-primary font-medium"
      >
        Fiche
      </a>
    </div>
  );
}
