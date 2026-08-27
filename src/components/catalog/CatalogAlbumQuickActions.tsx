"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  addOwnedAlbumAction,
  addToTrackingAlbumAction,
  removeFromCollectionAction,
} from "@/app/actions/collection";

export default function CatalogAlbumQuickActions({
  albumReferenceId,
  tracked,
  owned,
  collectionItemId,
}: {
  albumReferenceId: string;
  seriesReferenceId: string;
  tracked: boolean;
  owned: boolean;
  collectionItemId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {owned ? (
        <>
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-success/10 text-success font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Possédé
          </span>
          {collectionItemId && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await removeFromCollectionAction(collectionItemId, albumReferenceId);
                  router.refresh();
                })
              }
              className="text-xs px-2 py-1 rounded-md border border-border text-text-muted hover:text-danger hover:border-danger/50 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Retirer"}
            </button>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await addOwnedAlbumAction(albumReferenceId);
                router.refresh();
              })
            }
            className="text-xs px-2 py-1 rounded-md bg-primary text-white font-medium disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Je l'ai"}
          </button>
          {!tracked && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await addToTrackingAlbumAction(albumReferenceId);
                  router.refresh();
                })
              }
              className="text-xs px-2 py-1 rounded-md border border-border text-text-secondary disabled:opacity-50"
            >
              Suivre
            </button>
          )}
        </>
      )}
      <Link
        href={`/albums/${albumReferenceId}`}
        className="text-xs px-2 py-1 rounded-md border border-border text-text-secondary font-medium"
      >
        Fiche
      </Link>
    </div>
  );
}
