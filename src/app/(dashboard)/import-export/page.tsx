import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ImportForm from "@/components/forms/ImportForm";

export default function ImportExportPage() {
  return (
    <div>
      <PageHeader
        title="Import / Export"
        description="Importez ou exportez les données de votre collection"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text-primary">
              Exporter
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-text-secondary mb-4">
              Téléchargez les données de votre collection dans le format de
              votre choix.
            </p>

            <a
              href="/api/export?type=albums&format=json"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-surface-alt transition-colors group"
            >
              <FileJson className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                  Albums — JSON
                </p>
                <p className="text-xs text-text-muted">
                  Format structuré, idéal pour la sauvegarde
                </p>
              </div>
            </a>

            <a
              href="/api/export?type=albums&format=csv"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-surface-alt transition-colors group"
            >
              <FileSpreadsheet className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                  Albums — CSV
                </p>
                <p className="text-xs text-text-muted">
                  Compatible tableurs (Excel, LibreOffice)
                </p>
              </div>
            </a>

            <a
              href="/api/export?type=series&format=json"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-surface-alt transition-colors group"
            >
              <FileJson className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                  Séries — JSON
                </p>
                <p className="text-xs text-text-muted">
                  Export des séries avec comptage d&apos;albums
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Upload className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text-primary">
              Importer
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-text-secondary mb-4">
              Importez des albums depuis un fichier JSON. Le format attendu est
              un tableau d&apos;objets avec les champs : serie, titre, auteur,
              editeur, dateParution, tome, editionOriginale.
            </p>
            <ImportForm />
          </div>
        </div>
      </div>
    </div>
  );
}
