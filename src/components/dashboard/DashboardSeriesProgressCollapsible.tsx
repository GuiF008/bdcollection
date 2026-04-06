"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Target } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";

const STORAGE_KEY = "bdcollection:dashboardSeriesProgressOpen";

export type SeriesProgressRow = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  totalRefs: number;
  owned: number;
  confirmedEo: number;
  missing: number;
};

export default function DashboardSeriesProgressCollapsible({ series }: { series: SeriesProgressRow[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setOpen(true);
      else if (v === "0") setOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  function setOpenPersist(next: boolean) {
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  if (series.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border mb-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Progression par série (catalogue)
          </h2>
          <Link href="/catalog" className="text-sm text-primary hover:underline font-medium">
            Catalogue
          </Link>
        </div>
        <div className="p-10 text-center text-text-muted text-sm">
          Importez une série pour commencer le suivi.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border mb-10 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-surface-alt/20">
        <button
          type="button"
          onClick={() => setOpenPersist(!open)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-surface-alt/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-expanded={open}
        >
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
          <Target className="h-5 w-5 text-primary shrink-0" />
          <span className="text-base sm:text-lg font-semibold text-text-primary truncate">
            Progression par série (catalogue)
          </span>
          <span className="text-sm font-normal text-text-muted shrink-0 hidden sm:inline">
            ({series.length})
          </span>
        </button>
        <Link href="/catalog" className="text-sm text-primary hover:underline font-medium shrink-0 px-1">
          Catalogue
        </Link>
      </div>

      {open && (
        <ul className="divide-y divide-border">
          {series.map((s) => {
            const pct = s.totalRefs > 0 ? Math.round((s.owned / s.totalRefs) * 100) : 0;
            return (
              <li key={s.id}>
                <Link
                  href={`/catalog/${s.id}`}
                  className="flex items-center gap-5 px-6 py-5 hover:bg-surface-alt/40 transition-colors"
                >
                  <CoverImage src={s.coverImageUrl} alt={s.title} size="md" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-text-primary truncate">{s.title}</p>
                    <p className="text-sm text-text-muted mt-1">
                      Possédés {s.owned} / {s.totalRefs} · EO confirmées {s.confirmedEo} · Manquants{" "}
                      {s.missing}
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-surface-alt overflow-hidden max-w-xl">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary shrink-0 tabular-nums">{pct}%</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
