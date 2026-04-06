"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkPatchCollectionItemsAction } from "@/app/actions/collection";
import {
  CompletenessStatus,
  ConditionGrade,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "@/generated/prisma/enums";

const SKIP = "";

type Props = {
  seriesReferenceId: string;
  albumReferenceIds: string[];
  disabled?: boolean;
  /** Ex. vider la sélection après une mise à jour réussie */
  onApplied?: () => void;
};

export default function BulkCollectionCriteriaForm({
  seriesReferenceId,
  albumReferenceIds,
  disabled,
  onApplied,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [ownershipStatus, setOwnership] = useState(SKIP);
  const [searchStatus, setSearch] = useState(SKIP);
  const [editionStatus, setEdition] = useState(SKIP);
  const [editionConfidence, setConfidence] = useState(SKIP);
  const [conditionGrade, setCondition] = useState(SKIP);
  const [completenessStatus, setCompleteness] = useState(SKIP);
  const [isDuplicate, setDup] = useState(SKIP);
  const [hasPersonalPhoto, setPhoto] = useState(SKIP);

  function apply() {
    setMessage(null);
    start(async () => {
      const patch: Parameters<typeof bulkPatchCollectionItemsAction>[2] = {};
      if (ownershipStatus) patch.ownershipStatus = ownershipStatus as OwnershipStatus;
      if (searchStatus) patch.searchStatus = searchStatus as SearchStatus;
      if (editionStatus) patch.editionStatus = editionStatus as EditionStatus;
      if (editionConfidence) patch.editionConfidence = editionConfidence as EditionConfidence;
      if (conditionGrade) patch.conditionGrade = conditionGrade as ConditionGrade;
      if (completenessStatus) patch.completenessStatus = completenessStatus as CompletenessStatus;
      if (isDuplicate === "true") patch.isDuplicate = true;
      if (isDuplicate === "false") patch.isDuplicate = false;
      if (hasPersonalPhoto === "true") patch.hasPersonalPhoto = true;
      if (hasPersonalPhoto === "false") patch.hasPersonalPhoto = false;

      const r = await bulkPatchCollectionItemsAction(seriesReferenceId, albumReferenceIds, patch);
      if (r.ok) {
        setMessage(`${r.count} exemplaire(s) mis à jour.`);
        onApplied?.();
        router.refresh();
      } else {
        setMessage(r.error);
      }
    });
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/80 space-y-3">
      <p className="text-xs font-medium text-text-muted">
        Ne modifie que les champs laissés sur une valeur autre que « Ne pas modifier ».
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <SelectField
          label="Possession"
          value={ownershipStatus}
          onChange={setOwnership}
          options={[
            ["NOT_OWNED", "Ne possède pas"],
            ["OWNED", "Possédé"],
            ["WANTED", "Recherché"],
            ["HUNTING", "En chasse"],
            ["DUPLICATE", "Doublon (statut)"],
          ]}
        />
        <SelectField
          label="Recherche"
          value={searchStatus}
          onChange={setSearch}
          options={[
            ["NONE", "— (aucune)"],
            ["WANTED", "Sur liste"],
            ["HUNTING", "Actif"],
          ]}
        />
        <SelectField
          label="Édition"
          value={editionStatus}
          onChange={setEdition}
          options={[
            ["UNKNOWN", "Inconnu"],
            ["FIRST_EDITION", "Première édition"],
            ["SECOND_EDITION", "Deuxième édition"],
            ["THIRD_EDITION", "Troisième édition"],
            ["NOT_FIRST_EDITION", "Pas la première"],
          ]}
        />
        <SelectField
          label="Certitude (édition)"
          value={editionConfidence}
          onChange={setConfidence}
          options={[
            ["TO_VERIFY", "À vérifier"],
            ["PROBABLE", "Probable"],
            ["CONFIRMED", "Confirmé"],
          ]}
        />
        <SelectField
          label="État"
          value={conditionGrade}
          onChange={setCondition}
          options={[
            ["UNKNOWN", "Non renseigné"],
            ["MINT", "Neuf / mint"],
            ["EXCELLENT", "Excellent"],
            ["VERY_GOOD", "Très bon"],
            ["GOOD", "Bon"],
            ["FAIR", "Moyen"],
            ["POOR", "Mauvais"],
          ]}
        />
        <SelectField
          label="Complétude"
          value={completenessStatus}
          onChange={setCompleteness}
          options={[
            ["UNKNOWN", "Inconnu"],
            ["COMPLETE", "Complet"],
            ["INCOMPLETE", "Incomplet"],
          ]}
        />
        <SelectField
          label="Doublon (exemplaire)"
          value={isDuplicate}
          onChange={setDup}
          bool
        />
        <SelectField
          label="Photo perso"
          value={hasPersonalPhoto}
          onChange={setPhoto}
          bool
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || pending || albumReferenceIds.length === 0}
          onClick={apply}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-50"
        >
          {pending ? "Application…" : "Appliquer les critères"}
        </button>
        {message && <span className="text-xs text-text-secondary">{message}</span>}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  bool,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: [string, string][];
  bool?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border px-2 py-1.5 text-xs bg-white"
      >
        <option value={SKIP}>Ne pas modifier</option>
        {bool ? (
          <>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </>
        ) : (
          options?.map(([k, lab]) => (
            <option key={k} value={k}>
              {lab}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
