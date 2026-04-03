"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-surface-alt text-text-secondary"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 max-w-xl">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/albums/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter un album</span>
        </Link>
      </div>
    </header>
  );
}
