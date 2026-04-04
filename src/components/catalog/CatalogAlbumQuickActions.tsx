"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToTrackingAlbumAction } from "@/app/actions/collection";

export default function CatalogAlbumQuickActions({
  albumReferenceId,
  seriesReferenceId,
  tracked,
}: {
  albumReferenceId: string;
  seriesReferenceId: string;
  tracked: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {!tracked ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await addToTrackingAlbumAction(albumReferenceId);
              router.refresh();
            })
          }
          className="text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-50"
        >
          Ajouter à mon suivi
        </button>
      ) : (
        <Link
          href={`/collection/${seriesReferenceId}`}
          className="text-xs px-2 py-1 rounded-md border border-primary text-primary font-medium inline-flex items-center"
        >
          Affiner dans ma collection
        </Link>
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
