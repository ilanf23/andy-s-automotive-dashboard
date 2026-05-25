import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Wrench,
  AlertTriangle,
  Check,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import {
  AIBubble,
  ConfidencePill,
  SourcePill,
  type Confidence,
} from "@/components/ai/AIPrimitives";

type Cause = {
  id: string;
  probability: number;
  label: string;
  confidence: Confidence;
  reasoning: string;
  estimatedTime: string;
  parts: string[];
  similar: string;
};

const SCENARIO_CAUSES: Cause[] = [
  {
    id: "c1",
    probability: 62,
    label: "Rear wheel speed sensor — driver side (corrosion at connector)",
    confidence: "high",
    reasoning:
      "Code C0040 specifically points to LR wheel speed circuit. 'Above 45mph only' rules out a hard short — it's intermittent at higher rotational speed, typical of corrosion that opens under vibration. Your shop has seen this exact pattern 3 times on E-450 ambulances, all driver-side LR.",
    estimatedTime: "0.8–1.2 hrs",
    parts: ["MTC-ALS-2245 (ABS sensor)", "Dielectric grease"],
    similar: "RO #4774 — MT-52, March 2026, fixed in 1.1 hrs",
  },
  {
    id: "c2",
    probability: 24,
    label: "Loose tone ring at rear hub",
    confidence: "medium",
    reasoning:
      "Less common but matches the 'speed-dependent' pattern. Tone ring shifts under high RPM, sensor reads noise. Requires hub removal — significantly more labor than sensor swap.",
    estimatedTime: "2.5–3.5 hrs",
    parts: ["Hub bearing assembly (if damaged)", "Tone ring"],
    similar: "No prior matches in your shop",
  },
  {
    id: "c3",
    probability: 14,
    label: "ABS module fault (rare)",
    confidence: "low",
    reasoning:
      "Only matches if scan reveals other simultaneous codes. Worth ruling out by clearing the code and seeing if it returns for the same sensor specifically.",
    estimatedTime: "0.5 hr diagnostic + $850 module",
    parts: ["Ford ABS module (special order)"],
    similar: "No matches",
  },
];

const TROUBLESHOOTING_STEPS = [
  { id: "t1", label: "Clear DTC, drive 5 min above 45mph, confirm C0040 returns" },
  { id: "t2", label: "Visually inspect LR wheel speed sensor connector for corrosion" },
  { id: "t3", label: "Measure resistance across sensor (should be 1100–2200 Ω)" },
  { id: "t4", label: "Wiggle test the harness while monitoring scan tool live data" },
  { id: "t5", label: "If sensor confirmed bad → R&R per cause #1 above" },
];

type Phase = "input" | "thinking" | "results";

const THINKING_STEPS = [
  "Parsing symptom: intermittent C0040, above 45mph, LR ambulance",
  "Searching your shop's 12-month history for similar patterns",
  "Cross-referencing Mitchell1 diagnostic flow for C0040",
  "Filtering by your vehicle population (E-450 ambulance fleet)",
  "Computing probability across likely causes",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill symptom (optional — from inspection finding) */
  initialSymptom?: string;
};

export function DiagnosticAssistantModal({
  open,
  onOpenChange,
  initialSymptom,
}: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [step, setStep] = useState(0);
  const [symptom, setSymptom] = useState(
    initialSymptom ??
      "Intermittent ABS code C0040, occurs above 45mph only — MT-47 E-450",
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPhase("input");
      setStep(0);
      if (initialSymptom) setSymptom(initialSymptom);
    }
  }, [open, initialSymptom]);

  useEffect(() => {
    if (phase !== "thinking") return;
    if (step < THINKING_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("results");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 350);
    return () => clearTimeout(t);
  }, [phase, step]);

  const submit = () => {
    if (!symptom.trim()) return;
    setStep(0);
    setPhase("thinking");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Diagnostic Assistant"
      description="Describe a symptom — AI ranks causes, suggests next steps from your shop history"
      size="xl"
    >
      <div className="space-y-4">
        {/* Symptom input — always visible */}
        <div className="rounded-lg border border-border bg-surface/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Symptom
            </span>
            {phase === "results" && (
              <button
                type="button"
                onClick={() => {
                  setPhase("input");
                  setStep(0);
                }}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Edit & re-run
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              disabled={phase !== "input"}
              rows={2}
              placeholder="Describe the issue — fault code, when it happens, what changes…"
              className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:bg-surface disabled:opacity-70"
            />
            {phase === "input" && (
              <button
                type="button"
                onClick={submit}
                className="inline-flex shrink-0 items-center gap-1.5 self-stretch rounded-md bg-brand-green px-3 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
              >
                <Send className="h-3 w-3" />
                Diagnose
              </button>
            )}
          </div>
        </div>

        {/* Phase content */}
        {phase === "thinking" && (
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <AIBubble>Analyzing</AIBubble>
              </div>
            </div>
            <ul className="space-y-2 p-4">
              {THINKING_STEPS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <li
                    key={label}
                    className={clsx(
                      "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] transition-all",
                      done && "border-brand-green/30 bg-brand-green-tint",
                      current && "border-brand-green bg-brand-green-tint animate-pulse",
                      !done && !current && "border-border opacity-50",
                    )}
                  >
                    <span
                      className={clsx(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                        done && "bg-brand-green text-brand-green-foreground",
                        current && "bg-foreground text-background",
                        !done && !current && "bg-surface",
                      )}
                    >
                      {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span className={clsx(done && "text-brand-green-soft")}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {phase === "results" && (
          <>
            {/* Ranked causes */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                <TrendingUp className="h-3.5 w-3.5 text-brand-green-soft" />
                Likely causes — ranked by probability
              </h3>
              <ul className="space-y-2">
                {SCENARIO_CAUSES.map((c, idx) => (
                  <li
                    key={c.id}
                    className={clsx(
                      "rounded-lg border bg-background p-3 transition-all",
                      idx === 0
                        ? "border-brand-green/40 bg-brand-green-tint/30"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md font-bold",
                          idx === 0
                            ? "bg-brand-green text-brand-green-foreground"
                            : "bg-surface text-foreground",
                        )}
                      >
                        <span className="text-lg tabular-nums leading-none">
                          {c.probability}
                        </span>
                        <span className="text-[8px] opacity-80">%</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && (
                            <span className="rounded-full bg-brand-green px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-green-foreground">
                              Most likely
                            </span>
                          )}
                          <span className="text-sm font-semibold">{c.label}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <ConfidencePill confidence={c.confidence} />
                          <SourcePill source="shop-history" />
                          <SourcePill source="mitchell1" />
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                          {c.reasoning}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-2 text-[10px]">
                          <div>
                            <div className="font-semibold uppercase tracking-wider text-muted-foreground">
                              Est. time
                            </div>
                            <div className="mt-0.5 font-semibold tabular-nums">
                              {c.estimatedTime}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold uppercase tracking-wider text-muted-foreground">
                              Parts
                            </div>
                            <div className="mt-0.5 truncate">{c.parts[0]}</div>
                          </div>
                          <div>
                            <div className="font-semibold uppercase tracking-wider text-muted-foreground">
                              Similar in shop
                            </div>
                            <div className="mt-0.5 truncate">{c.similar}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Troubleshooting tree */}
            <div className="rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold">
                  <Wrench className="h-3.5 w-3.5" />
                  Suggested troubleshooting sequence
                </h3>
                <button className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                  Send to Marcus
                </button>
              </div>
              <ol className="divide-y divide-border">
                {TROUBLESHOOTING_STEPS.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-surface/40"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {i + 1}
                    </div>
                    <p className="text-xs">{s.label}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div ref={bottomRef} />
          </>
        )}
      </div>
    </Modal>
  );
}
