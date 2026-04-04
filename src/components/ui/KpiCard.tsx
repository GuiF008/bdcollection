import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "success";
  /** Si défini, toute la carte est cliquable */
  href?: string;
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
};

export default function KpiCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  href,
}: KpiCardProps) {
  const inner = (
    <>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </>
  );

  const shellClass =
    "bg-white rounded-xl border border-border p-5 flex items-center gap-4 transition-[box-shadow,border-color]";

  if (href) {
    return (
      <Link
        href={href}
        className={`${shellClass} hover:border-primary/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}
