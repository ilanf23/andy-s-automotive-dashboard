import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Props = {
  label: string;
  value: string;
  subValue?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  icon?: LucideIcon;
  accent?: "default" | "success" | "warning" | "danger" | "ink";
  compact?: boolean;
};

const accentBar: Record<NonNullable<Props["accent"]>, string> = {
  default: "bg-muted-foreground/40",
  success: "bg-success",
  warning: "bg-[#F59E0B]",
  danger: "bg-destructive",
  ink: "bg-foreground",
};

export function MetricTile({
  label,
  value,
  subValue,
  delta,
  deltaDirection = "flat",
  icon: Icon,
  accent = "default",
  compact = false,
}: Props) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg border border-border bg-background",
        compact ? "p-3" : "p-4",
      )}
    >
      <span
        className={clsx(
          "absolute left-0 top-0 h-full w-0.5",
          accentBar[accent],
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className={clsx(
            "font-semibold tracking-tight",
            compact ? "text-xl" : "text-2xl",
          )}
        >
          {value}
        </span>
        {subValue && (
          <span className="text-[11px] text-muted-foreground">{subValue}</span>
        )}
      </div>
      {delta && (
        <div
          className={clsx(
            "mt-0.5 text-[11px] font-medium",
            deltaDirection === "up" && "text-success",
            deltaDirection === "down" && "text-destructive",
            deltaDirection === "flat" && "text-muted-foreground",
          )}
        >
          {deltaDirection === "up" && "▲ "}
          {deltaDirection === "down" && "▼ "}
          {delta}
        </div>
      )}
    </div>
  );
}
