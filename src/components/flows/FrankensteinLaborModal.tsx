import { useState, useEffect } from "react";
import { Wrench, Sparkles, AlertTriangle, Check, Clock } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  ConfidencePill,
  SourcePill,
  AIThinkingPanel,
  AIBubble,
} from "@/components/ai/AIPrimitives";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Job description being looked up, e.g., "R&R front brake pads" */
  jobDescription?: string;
  /** Vehicle context */
  vehicleLabel?: string;
};

type SimilarJob = {
  roId: string;
  vehicle: string;
  date: string;
  hours: number;
  techName: string;
};

// Hardcoded for the Frankenstein FT-3 demo scenario
const PROPOSAL = {
  description: "R&R front brake pads + rotor turn",
  vehicleLabel: "Form Tech FT-3 · 2008 GMC C6500 Top Kick (Frankenstein)",
  suggestedHours: 4.1,
  confidence: "high" as const,
  confidencePercent: 88,
  mitchell1Available: false,
  reasoning:
    "Mitchell1 has no labor guide for this Frankenstein build (custom chassis, Allison 3000 swap). Falling back to your shop's history — 4 similar brake jobs on Class 5-6 modified trucks averaged 4.1 hrs. Your shop's median for this category is 3.9 hrs. Adding +5% margin for first-time vehicle.",
  similarJobs: [
    { roId: "4781", vehicle: "Med Trust MT-52 (E-450)", date: "Apr 4, 2026", hours: 4.2, techName: "Marcus" },
    { roId: "4733", vehicle: "City Form 221 (F-550)", date: "Jan 18, 2026", hours: 4.0, techName: "Marcus" },
    { roId: "4691", vehicle: "FCS-118 (Intl MV607)", date: "Nov 22, 2025", hours: 4.1, techName: "Jose" },
    { roId: "4612", vehicle: "Davy DT-7 (F-750)", date: "Sep 9, 2025", hours: 4.0, techName: "Marcus" },
  ] as SimilarJob[],
};

const THINKING_STEPS = [
  "Checking Mitchell1 ProDemand for this VIN",
  "Mitchell1 missing — falling back to shop history",
  "Indexing 47 brake jobs from your last 12 months",
  "Filtering to Class 5-6 + similar chassis weight",
  "Computing median + confidence interval",
];

export function FrankensteinLaborModal({
  open,
  onOpenChange,
  jobDescription,
  vehicleLabel,
}: Props) {
  const [phase, setPhase] = useState<"thinking" | "review">("thinking");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setPhase("thinking");
      setStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "thinking") return;
    if (step < THINKING_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("review"), 350);
    return () => clearTimeout(t);
  }, [open, phase, step]);

  const handleApply = () => {
    toast.success(`Applied ${PROPOSAL.suggestedHours} hrs to estimate line`, {
      description: `Sourced from your shop history (Mitchell1 unavailable for Frankenstein build)`,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="AI Labor Lookup"
      description={
        phase === "thinking"
          ? "Building labor estimate from your shop's history…"
          : "Found a confident estimate from your past jobs"
      }
      size="md"
      footer={
        phase === "review" ? (
          <>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Skip — enter manually
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Check className="h-3 w-3" />
              Apply {PROPOSAL.suggestedHours} hrs
            </button>
          </>
        ) : null
      }
    >
      {phase === "thinking" && (
        <AIThinkingPanel steps={THINKING_STEPS} currentStep={step} />
      )}

      {phase === "review" && (
        <div className="space-y-4">
          {/* Frankenstein warning */}
          <div className="flex items-start gap-2 rounded-md border border-[#FBCFE8]/60 bg-[#FCE7F3]/40 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9D174D]" />
            <div>
              <p className="text-xs font-semibold text-[#9D174D]">
                Frankenstein vehicle — Mitchell1 has no labor guide
              </p>
              <p className="mt-0.5 text-[10px] text-[#9D174D]/80">
                {jobDescription ?? PROPOSAL.description} on {vehicleLabel ?? PROPOSAL.vehicleLabel}
              </p>
            </div>
          </div>

          {/* Headline proposal */}
          <div className="rounded-lg border border-brand-green/30 bg-brand-green-tint p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <AIBubble>AI Proposed</AIBubble>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular-nums text-foreground">
                    {PROPOSAL.suggestedHours}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    hrs
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-brand-green-soft">
                  @ $148/hr ={" "}
                  <span className="font-semibold tabular-nums">
                    ${(PROPOSAL.suggestedHours * 148).toFixed(0)}
                  </span>{" "}
                  labor
                </div>
              </div>
              <ConfidencePill
                confidence={PROPOSAL.confidence}
                percent={PROPOSAL.confidencePercent}
                size="md"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <SourcePill source="shop-history" />
              <SourcePill source="ai-inferred" />
            </div>
            <p className="mt-3 border-t border-brand-green/20 pt-3 text-[11px] leading-relaxed text-foreground/85">
              {PROPOSAL.reasoning}
            </p>
          </div>

          {/* Similar jobs from shop history */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Similar jobs in your shop
              </h3>
              <span className="text-[10px] text-muted-foreground">
                Median: 4.05 hrs · Range: 4.0–4.2
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="border-b border-border bg-surface/40 text-[9px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-semibold">RO</th>
                    <th className="px-3 py-1.5 text-left font-semibold">Vehicle</th>
                    <th className="px-3 py-1.5 text-left font-semibold">Tech</th>
                    <th className="px-3 py-1.5 text-right font-semibold">Date</th>
                    <th className="px-3 py-1.5 text-right font-semibold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPOSAL.similarJobs.map((j) => (
                    <tr key={j.roId} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 font-mono text-[10px]">#{j.roId}</td>
                      <td className="px-3 py-1.5 text-[10px]">{j.vehicle}</td>
                      <td className="px-3 py-1.5 text-[10px]">{j.techName}</td>
                      <td className="px-3 py-1.5 text-right text-[10px] text-muted-foreground">
                        {j.date}
                      </td>
                      <td className="px-3 py-1.5 text-right text-[10px] font-semibold tabular-nums">
                        {j.hours.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
