"use client";

import { useTransition } from "react";
import { updateCollectionItemAction } from "@/app/actions/collection";
import type { CollectionItemWithRef } from "@/lib/domain/types";
import {
  CompletenessStatus,
  ConditionGrade,
  EditionConfidence,
  EditionStatus,
  OwnershipStatus,
  SearchStatus,
} from "@/generated/prisma/enums";

type Props = {
  item: CollectionItemWithRef;
  albumReferenceId: string;
};

const labels = {
  ownership: {
    NOT_OWNED: "Ne possède pas",
    OWNED: "Possédé",
    WANTED: "Recherché",
    HUNTING: "En chasse",
    DUPLICATE: "Doublon",
  },
  edition: {
    UNKNOWN: "Inconnu",
    FIRST_EDITION: "Première édition",
    NOT_FIRST_EDITION: "Pas la première",
  },
  confidence: {
    TO_VERIFY: "À vérifier",
    PROBABLE: "Probable",
    CONFIRMED: "Confirmé",
  },
  condition: {
    UNKNOWN: "Non renseigné",
    MINT: "Neuf / mint",
    EXCELLENT: "Excellent",
    VERY_GOOD: "Très bon",
    GOOD: "Bon",
    FAIR: "Moyen",
    POOR: "Mauvais",
  },
  complete: {
    COMPLETE: "Complet",
    INCOMPLETE: "Incomplet",
    UNKNOWN: "Inconnu",
  },
  search: {
    NONE: "—",
    WANTED: "Sur liste",
    HUNTING: "Actif",
  },
} as const;

export default function CollectionItemForm({ item, albumReferenceId }: Props) {
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const ownershipStatus = formData.get("ownershipStatus") as OwnershipStatus;
    const editionStatus = formData.get("editionStatus") as EditionStatus;
    const editionConfidence = formData.get("editionConfidence") as EditionConfidence;
    const conditionGrade = formData.get("conditionGrade") as ConditionGrade;
    const completenessStatus = formData.get("completenessStatus") as CompletenessStatus;
    const searchStatus = formData.get("searchStatus") as SearchStatus;
    const notes = (formData.get("notes") as string) || null;
    const purchaseSource = (formData.get("purchaseSource") as string) || null;
    const purchasePriceRaw = formData.get("purchasePrice") as string;
    const purchaseDateRaw = formData.get("purchaseDate") as string;
    const quantity = Math.max(1, parseInt(formData.get("quantity") as string, 10) || 1);
    const isDuplicate = formData.get("isDuplicate") === "on";

    startTransition(async () => {
      await updateCollectionItemAction(item.id, albumReferenceId, {
        ownershipStatus,
        editionStatus,
        editionConfidence,
        conditionGrade,
        completenessStatus,
        searchStatus,
        notes,
        purchaseSource,
        quantity,
        isDuplicate,
        purchasePrice: purchasePriceRaw ? parseFloat(purchasePriceRaw.replace(",", ".")) : null,
        purchaseDate: purchaseDateRaw || null,
      });
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Possession">
          <select
            name="ownershipStatus"
            defaultValue={item.ownershipStatus}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.ownership) as OwnershipStatus[]).map((k) => (
              <option key={k} value={k}>
                {labels.ownership[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Recherche">
          <select
            name="searchStatus"
            defaultValue={item.searchStatus}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.search) as SearchStatus[]).map((k) => (
              <option key={k} value={k}>
                {labels.search[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Première édition">
          <select
            name="editionStatus"
            defaultValue={item.editionStatus}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.edition) as EditionStatus[]).map((k) => (
              <option key={k} value={k}>
                {labels.edition[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Certitude EO">
          <select
            name="editionConfidence"
            defaultValue={item.editionConfidence}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.confidence) as EditionConfidence[]).map((k) => (
              <option key={k} value={k}>
                {labels.confidence[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="État">
          <select
            name="conditionGrade"
            defaultValue={item.conditionGrade}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.condition) as ConditionGrade[]).map((k) => (
              <option key={k} value={k}>
                {labels.condition[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Complétude">
          <select
            name="completenessStatus"
            defaultValue={item.completenessStatus}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {(Object.keys(labels.complete) as CompletenessStatus[]).map((k) => (
              <option key={k} value={k}>
                {labels.complete[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantité">
          <input
            type="number"
            name="quantity"
            min={1}
            defaultValue={item.quantity}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Prix d’achat (€)">
          <input
            type="text"
            name="purchasePrice"
            inputMode="decimal"
            defaultValue={item.purchasePrice?.toString() ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Date d’achat">
          <input
            type="date"
            name="purchaseDate"
            defaultValue={
              item.purchaseDate ? item.purchaseDate.toISOString().slice(0, 10) : ""
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Provenance">
          <input
            type="text"
            name="purchaseSource"
            defaultValue={item.purchaseSource ?? ""}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          name="notes"
          rows={4}
          defaultValue={item.notes ?? ""}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="isDuplicate" defaultChecked={item.isDuplicate} />
        Doublon (exemplaire en plus)
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}
