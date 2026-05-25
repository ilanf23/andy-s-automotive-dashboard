import clsx from "clsx";

export type ShopStatus =
  | "just-arrived"
  | "inspection"
  | "estimate-building"
  | "awaiting-approval"
  | "in-progress"
  | "ready"
  | "completed"
  | "lost-revenue"
  | "frankenstein"
  | "ai-estimated";

type Props = {
  status: ShopStatus | string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const statusStyles: Record<string, string> = {
  "just-arrived": "bg-surface text-foreground border-border",
  inspection: "bg-brand-yellow-tint text-brand-yellow-soft border-brand-yellow/50",
  "estimate-building": "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]",
  "awaiting-approval": "bg-brand-yellow-tint text-brand-yellow-soft border-brand-yellow",
  "in-progress": "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]",
  ready: "bg-brand-green text-brand-green-foreground border-brand-green",
  completed: "bg-brand-green-tint text-brand-green-soft border-brand-green-soft/40",
  "lost-revenue": "bg-brand-red-tint text-brand-red-soft border-brand-red/40",
  frankenstein: "bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]",
  "ai-estimated": "bg-brand-red-tint text-brand-red-soft border-brand-red/40",
};

const defaultLabels: Record<string, string> = {
  "just-arrived": "Just Arrived",
  inspection: "Inspection",
  "estimate-building": "Estimate Building",
  "awaiting-approval": "Awaiting Approval",
  "in-progress": "In Progress",
  ready: "Ready",
  completed: "Completed",
  "lost-revenue": "Lost Revenue Risk",
  frankenstein: "Frankenstein",
  "ai-estimated": "AI-Estimated",
};

export function StatusBadge({ status, label, size = "sm", className }: Props) {
  const style = statusStyles[status] ?? "bg-surface text-foreground border-border";
  const text = label ?? defaultLabels[status] ?? status;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        style,
        className,
      )}
    >
      {text}
    </span>
  );
}
