import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Camera,
  Clock,
  Wrench,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { AIThinkingPanel, SourcePill } from "@/components/ai/AIPrimitives";
import { postRepairOrder } from "@/lib/shop-store";

type Phase = "thinking" | "review" | "posting";

type Issue = {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  suggestion: string;
};

const ISSUES: Issue[] = [
  {
    id: "i1",
    severity: "high",
    category: "Missing data",
    icon: Camera,
    title: "Red finding missing photo",
    detail: "RO has 2 red findings; only 1 has photo attached. Customer-facing estimate looks thinner than the actual work.",
    suggestion: "Ask Marcus to upload the brake-pad photo before posting.",
  },
  {
    id: "i2",
    severity: "medium",
    category: "Labor anomaly",
    icon: Clock,
    title: "Labor 28% below shop average",
    detail: "Front brake job estimated at 2.5 hrs. Your shop's average for this job on E-450 ambulances is 4.1 hrs (last 4 jobs).",
    suggestion: "Likely missing the rotor turn - check if rotors were inspected. Should probably be 4.0 hrs.",
  },
  {
    id: "i3",
    severity: "medium",
    category: "Unestimated work",
    icon: Wrench,
    title: "1 inspection finding not on estimate",
    detail: "Rear ABS sensor (yellow) appears in the inspection but no line was added.",
    suggestion: "Run the AI Estimate Builder to auto-add it, or skip if customer declined verbally.",
  },
];

const THINKING_STEPS = [
  "Checking inspection findings against estimate lines",
  "Comparing labor times to your shop's history",
  "Validating photos on red findings",
  "Cross-checking parts ordered vs parts billed",
  "Running margin sanity check",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roId: string;
};

export function PreROQualityCheckModal({ open, onOpenChange, roId }: Props) {
  const [phase, setPhase] = useState<Phase>("thinking");
  const [step, setStep] = useState(0);
  const [ignored, setIgnored] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setPhase("thinking");
      setStep(0);
      setIgnored({});
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

  const unresolvedHigh = ISSUES.filter(
    (i) => i.severity === "high" && !ignored[i.id],
  );
  const unresolved = ISSUES.filter((i) => !ignored[i.id]);

  const handlePostAnyway = async () => {
    setPhase("posting");
    await new Promise((r) => setTimeout(r, 600));
    postRepairOrder(roId);
    toast.success(`RO #${roId} posted`, {
      description:
        unresolvedHigh.length > 0
          ? `Posted with ${unresolvedHigh.length} unresolved issue${unresolvedHigh.length === 1 ? "" : "s"} - review recommended`
          : "Clean audit · posted to A/R",
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (phase === "posting") return;
        onOpenChange(o);
      }}
      title="Pre-Post Quality Check"
      description={
        phase === "thinking"
          ? "AI is auditing this RO before you post it…"
          : phase === "review"
            ? `Found ${ISSUES.length} ${ISSUES.length === 1 ? "issue" : "issues"} worth a second look`
            : "Posting…"
      }
      size="lg"
      footer={
        phase === "review" ? (
          <>
            <div className="mr-auto text-[11px] text-muted-foreground">
              {unresolved.length} of {ISSUES.length} unresolved
              {unresolvedHigh.length > 0 && (
                <span className="ml-1 font-semibold text-destructive">
                  · {unresolvedHigh.length} high severity
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Go fix it
            </button>
            <button
              type="button"
              onClick={handlePostAnyway}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold",
                unresolvedHigh.length === 0
                  ? "bg-brand-green text-brand-green-foreground hover:opacity-90"
                  : "bg-foreground text-background hover:opacity-90",
              )}
            >
              <CheckCircle className="h-3 w-3" />
              {unresolvedHigh.length === 0 ? "Post - all clear" : "Post anyway"}
            </button>
          </>
        ) : null
      }
    >
      {phase === "thinking" && (
        <AIThinkingPanel steps={THINKING_STEPS} currentStep={step} />
      )}

      {phase === "review" && (
        <div className="space-y-3">
          {/* Summary band */}
          <div className="rounded-md border border-accent/40 bg-accent/15 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#991B1B]" />
              <div>
                <p className="text-xs font-semibold text-[#991B1B]">
                  {ISSUES.length} issues caught before this RO posts to A/R
                </p>
                <p className="mt-0.5 text-[11px] text-[#991B1B]/80">
                  Posting with high-severity issues can result in customer disputes,
                  warranty returns, or margin loss. Fix or override per issue.
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <SourcePill source="shop-history" />
              <SourcePill source="ai-inferred" />
            </div>
          </div>

          {/* Issue list */}
          <ul className="space-y-2">
            {ISSUES.map((issue) => {
              const Icon = issue.icon;
              const isIgnored = ignored[issue.id];
              return (
                <li
                  key={issue.id}
                  className={clsx(
                    "rounded-lg border bg-background p-3 transition-all",
                    isIgnored && "opacity-50",
                    !isIgnored && issue.severity === "high" && "border-destructive/30",
                    !isIgnored && issue.severity === "medium" && "border-accent/40",
                    !isIgnored && issue.severity === "low" && "border-border",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        issue.severity === "high" && "bg-destructive/10 text-destructive",
                        issue.severity === "medium" && "bg-accent/30 text-[#991B1B]",
                        issue.severity === "low" && "bg-surface text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={clsx(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            issue.severity === "high" && "bg-destructive text-destructive-foreground",
                            issue.severity === "medium" && "bg-accent text-accent-foreground",
                            issue.severity === "low" && "bg-surface text-foreground",
                          )}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {issue.category}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-semibold">{issue.title}</div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {issue.detail}
                      </p>
                      <p className="mt-1.5 text-[11px] text-brand-green-soft">
                        <span className="font-semibold">Suggested fix:</span>{" "}
                        {issue.suggestion}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!isIgnored && (
                        <button
                          type="button"
                          onClick={() =>
                            setIgnored((p) => ({ ...p, [issue.id]: true }))
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-surface"
                        >
                          Ignore
                        </button>
                      )}
                      {isIgnored && (
                        <button
                          type="button"
                          onClick={() =>
                            setIgnored((p) => ({ ...p, [issue.id]: false }))
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold hover:bg-surface"
                        >
                          Un-ignore
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          toast.success(`Routed: ${issue.title}`);
                          setIgnored((p) => ({ ...p, [issue.id]: true }));
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold text-background hover:opacity-90"
                      >
                        Fix
                        <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {phase === "posting" && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/30" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Posting RO + filing to A/R…</p>
        </div>
      )}
    </Modal>
  );
}
