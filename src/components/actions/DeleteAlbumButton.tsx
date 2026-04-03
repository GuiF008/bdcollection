"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAlbumAction } from "@/app/actions/albums";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface DeleteAlbumButtonProps {
  id: string;
  title: string;
  redirectTo?: string;
}

export default function DeleteAlbumButton({
  id,
  title,
  redirectTo = "/albums",
}: DeleteAlbumButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAlbumAction(id);
      router.push(redirectTo);
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-danger/30 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer
      </button>
      <ConfirmDialog
        open={open}
        title="Supprimer l'album"
        message={`Êtes-vous sûr de vouloir supprimer "${title}" ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
        loading={loading}
      />
    </>
  );
}
