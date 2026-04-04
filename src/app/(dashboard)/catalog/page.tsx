export const dynamic = "force-dynamic";

import Link from "next/link";
import { Library } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getSeriesReferencesForCatalog } from "@/lib/services/catalogReferences.service";
import Badge from "@/components/ui/Badge";
import { CatalogSource } from "@/generated/prisma/enums";

export default async function CatalogPage() {
  const series = await getSeriesReferencesForCatalog();

  return (
    <div>
      <PageHeader
        title="Catalogue importé"
        description="Référentiel issu du scraping (Bedetheque, etc.). Rien n’est possédé tant que vous ne l’ajoutez pas à votre collection."
      />

      {series.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Aucune série en catalogue"
          description="Importez une série depuis la page Import / Export pour remplir le référentiel."
          actionLabel="Aller à Import / Export"
          actionHref="/import-export"
        />
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/catalog/${s.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-alt/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{s.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {s._count.albums} album{s._count.albums !== 1 ? "s" : ""} au catalogue
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.source === CatalogSource.bedetheque && <Badge variant="primary">Importé</Badge>}
                {s.source === CatalogSource.local && <Badge variant="default">Local</Badge>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
