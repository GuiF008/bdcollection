"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFromCollectionAction } from "@/app/actions/collection";

export default function RemoveFromCollectionButton({
  collectionItemId,
  albumReferenceId,
}: {
  collectionItemId: string;
  albumReferenceId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("Retirer cet album de votre collection ? La fiche catalogue reste disponible.")) {
            return;
          }
          await removeFromCollectionAction(collectionItemId, albumReferenceId);
          router.refresh();
        })
      }
      className="text-sm text-danger hover:underline disabled:opacity-50"
    >
      Retirer de ma collection
    </button>
  );
}
