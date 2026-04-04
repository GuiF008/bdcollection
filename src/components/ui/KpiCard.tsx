import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "success";
  /** Si défini, toute la carte est cliquable */
  href?: string;
  /** Variante plus grande pour le tableau de bord */
  size?: "default" | "lg";
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
  size = "default",
}: KpiCardProps) {
  const isLg = size === "lg";
  const inner = (
    <>
      <div
        className={`flex items-center justify-center rounded-xl ${colorMap[color]} ${
          isLg ? "h-14 w-14" : "h-12 w-12 rounded-lg"
        }`}
      >
        <Icon className={isLg ? "h-7 w-7" : "h-6 w-6"} />
      </div>
      <div>
        <p className={`text-text-secondary ${isLg ? "text-sm" : "text-sm"}`}>{title}</p>
        <p className={`font-bold text-text-primary ${isLg ? "text-3xl mt-1" : "text-2xl"}`}>{value}</p>
      </div>
    </>
  );

  const shellClass = `bg-white rounded-xl border border-border flex items-center gap-4 transition-[box-shadow,border-color] ${
    isLg ? "p-6 min-h-[104px]" : "p-5"
  }`;

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
