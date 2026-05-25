import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Tone = "default" | "accent" | "success" | "warning" | "danger" | "ink";

type Props = {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  icon?: LucideIcon;
  tone?: Tone;
  footnote?: string;
};

const toneIconStyles: Record<Tone, string> = {
  default: "bg-surface text-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-[#F59E0B] text-white",
  danger: "bg-destructive text-destructive-foreground",
  ink: "bg-foreground text-background",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaDirection = "flat",
  icon: Icon,
  tone = "default",
  footnote,
}: Props) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              toneIconStyles[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={clsx(
              "font-medium",
              deltaDirection === "up" && "text-success",
              deltaDirection === "down" && "text-destructive",
              deltaDirection === "flat" && "text-muted-foreground",
            )}
          >
            {deltaDirection === "up" && "▲ "}
            {deltaDirection === "down" && "▼ "}
            {delta}
          </span>
        )}
        {footnote && <span className="text-muted-foreground">{footnote}</span>}
      </div>
    </div>
  );
}
