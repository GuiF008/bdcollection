export const dynamic = "force-dynamic";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { listCollectionGroups } from "@/lib/services/collectionGroups.service";
import CollectionGroupsManagerClient from "@/components/collection/CollectionGroupsManagerClient";

export default async function CollectionGroupsPage() {
  const groups = await listCollectionGroups();

  return (
    <div>
      <PageHeader
        title="Groupes de séries"
        description="Regroupez vos séries suivies (filtre sur « Ma collection », organisation personnelle)."
        actions={
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
          >
            Ma collection
          </Link>
        }
      />
      <CollectionGroupsManagerClient initialGroups={groups} />
    </div>
  );
}
