import { Settings, Database, Image, Rocket } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Paramètres"
        description="Configuration de l'application"
      />

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text-primary">
              Général
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                Application
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                BD Collection — MVP v1.0
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Application self-hosted de gestion de collection de bandes dessinées.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">Stack</h3>
              <p className="text-sm text-text-secondary mt-1">
                Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Database className="h-5 w-5 text-secondary" />
            <h2 className="text-base font-semibold text-text-primary">
              Données
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                Export des données
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Rendez-vous sur la page{" "}
                <a
                  href="/import-export"
                  className="text-primary hover:underline"
                >
                  Import / Export
                </a>{" "}
                pour télécharger vos données en JSON ou CSV.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                Base de données
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                PostgreSQL — les données sont stockées localement sur votre VPS.
                Aucune donnée n&apos;est envoyée à l&apos;extérieur.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Image className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">
              Images
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                Stockage des couvertures
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Les images de couverture sont stockées localement dans le
                répertoire <code className="text-xs bg-surface-alt px-1.5 py-0.5 rounded">./uploads/</code> sur le VPS.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                Formats supportés
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                JPEG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Rocket className="h-5 w-5 text-success" />
            <h2 className="text-base font-semibold text-text-primary">
              Future V2 — Intégrations externes
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-text-secondary">
              Le MVP fonctionne en totale autonomie, sans aucune dépendance
              externe. L&apos;architecture est cependant prête pour accueillir
              des intégrations dans une future V2.
            </p>

            <div className="bg-surface-alt rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Fonctionnalités prévues en V2
              </h3>
              <ul className="text-sm text-text-secondary space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Connexion à des API de référencement BD (BDGest, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Récupération automatique de couvertures
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Enrichissement des métadonnées via ISBN/EAN
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Récupération des cotes et valorisations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  Synchronisation avec des bases de données externes
                </li>
              </ul>
            </div>

            <div className="bg-surface-alt rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Champs déjà prêts dans le modèle
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-text-secondary">
                <span>externalSource</span>
                <span>externalId</span>
                <span>isbn</span>
                <span>ean</span>
                <span>editionLabel</span>
                <span>estimatedValue</span>
                <span>valuationSource</span>
                <span>lastSyncAt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
