import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "success";
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
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
