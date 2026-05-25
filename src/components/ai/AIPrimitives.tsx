import clsx from "clsx";
import { Sparkles, Zap, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// ============================================================================
// Confidence pill — used by every AI surface
// ============================================================================

export type Confidence = "high" | "medium" | "low";

export function ConfidencePill({
  confidence,
  percent,
  size = "sm",
}: {
  confidence: Confidence;
  percent?: number;
  size?: "sm" | "md";
}) {
  const styles: Record<Confidence, string> = {
    high: "bg-brand-green-tint text-brand-green-soft border-brand-green/40",
    medium: "bg-accent/30 text-[#991B1B] border-accent/60",
    low: "bg-destructive/10 text-destructive border-destructive/40",
  };
  const label: Record<Confidence, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-bold",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        styles[confidence],
      )}
    >
      <Zap className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span className="uppercase tracking-wider">{label[confidence]}</span>
      {percent != null && (
        <span className="tabular-nums opacity-80">{percent}%</span>
      )}
    </span>
  );
}

// ============================================================================
// Source pill — citations for AI proposals
// ============================================================================

export type Source =
  | "shop-history"
  | "mitchell1"
  | "worldpac"
  | "napa"
  | "oem"
  | "ai-inferred"
  | "fleetio"
  | "holman"
  | "tsb"
  | "vin-decode";

const SOURCE_LABELS: Record<Source, string> = {
  "shop-history": "Shop History",
  mitchell1: "Mitchell1",
  worldpac: "Worldpac",
  napa: "NAPA",
  oem: "OEM",
  "ai-inferred": "AI Inferred",
  fleetio: "Fleetio",
  holman: "Holman",
  tsb: "Service Bulletin",
  "vin-decode": "VIN Decode",
};

const SOURCE_STYLES: Record<Source, string> = {
  "shop-history": "bg-foreground text-background",
  mitchell1: "bg-[#3730A3] text-white",
  worldpac: "bg-[#1E40AF] text-white",
  napa: "bg-[#DC2626] text-white",
  oem: "bg-success text-success-foreground",
  "ai-inferred": "bg-accent text-accent-foreground",
  fleetio: "bg-[#0891B2] text-white",
  holman: "bg-[#7C3AED] text-white",
  tsb: "bg-[#92400E] text-white",
  "vin-decode": "bg-[#64748B] text-white",
};

export function SourcePill({ source }: { source: Source }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        SOURCE_STYLES[source],
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}

// ============================================================================
// Thinking panel — streaming reasoning steps
// ============================================================================

export function AIThinkingPanel({
  steps,
  currentStep,
  size = "md",
}: {
  steps: string[];
  currentStep: number;
  size?: "sm" | "md";
}) {
  return (
    <div className={clsx(size === "md" ? "py-8" : "py-4")}>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-tint">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/20" />
            <Sparkles className="h-6 w-6 text-brand-green-soft" />
          </div>
        </div>
        <ul className="space-y-2.5">
          {steps.map((label, i) => {
            const done = i < currentStep;
            const current = i === currentStep;
            const pending = i > currentStep;
            return (
              <li
                key={label}
                className={clsx(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-[12px] transition-all",
                  done && "border-brand-green/30 bg-brand-green-tint",
                  current && "border-brand-green bg-brand-green-tint animate-pulse",
                  pending && "border-border bg-background opacity-50",
                )}
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    done && "bg-brand-green text-brand-green-foreground",
                    current && "bg-foreground text-background",
                    pending && "bg-surface text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : current ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-background" />
                  ) : null}
                </span>
                <span
                  className={clsx(
                    "font-medium",
                    done && "text-brand-green-soft",
                    current && "text-foreground",
                    pending && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Reasoning trace — expandable "Why?" section
// ============================================================================

export function ReasoningTrace({
  reasoning,
  similarJobs,
}: {
  reasoning: string;
  similarJobs?: { roId: string; vehicle: string; date: string; value?: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Why this proposal?
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-md border border-border bg-surface/30 p-2.5">
          <p className="text-[11px] leading-relaxed text-foreground/85">{reasoning}</p>
          {similarJobs && similarJobs.length > 0 && (
            <div className="border-t border-border pt-2">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Similar jobs in your shop
              </div>
              <ul className="mt-1 space-y-0.5">
                {similarJobs.map((j) => (
                  <li
                    key={j.roId}
                    className="flex items-center justify-between text-[10px]"
                  >
                    <span>
                      <span className="font-mono text-muted-foreground">RO #{j.roId}</span>{" "}
                      · {j.vehicle} · {j.date}
                    </span>
                    {j.value && (
                      <span className="font-semibold tabular-nums">{j.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ============================================================================
// AI bubble — small "AI-proposed" header chip
// ============================================================================

export function AIBubble({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-brand-green-tint px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-green-soft",
        className,
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {children}
    </span>
  );
}
