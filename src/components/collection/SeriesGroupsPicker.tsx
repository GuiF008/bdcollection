"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSeriesCollectionGroupsAction } from "@/app/actions/collectionGroups";

type GroupRow = { id: string; name: string };

export default function SeriesGroupsPicker({
  seriesReferenceId,
  groups,
  selectedIds,
}: {
  seriesReferenceId: string;
  groups: GroupRow[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle(groupId: string, checked: boolean) {
    const next = checked ? [...selectedIds, groupId] : selectedIds.filter((id) => id !== groupId);
    start(async () => {
      await setSeriesCollectionGroupsAction(seriesReferenceId, next);
      router.refresh();
    });
  }

  if (groups.length === 0) {
    return (
      <p className="text-xs text-text-muted">
        Aucun groupe pour l’instant.{" "}
        <Link href="/collection/groups" className="text-primary font-medium hover:underline">
          Créer des groupes
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {groups.map((g) => (
        <label
          key={g.id}
          className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(g.id)}
            disabled={pending}
            onChange={(e) => toggle(g.id, e.target.checked)}
            className="rounded border-border"
          />
          {g.name}
        </label>
      ))}
    </div>
  );
}
