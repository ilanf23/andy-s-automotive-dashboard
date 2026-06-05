import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Upload, Check, Package, Truck } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import {
  AIThinkingPanel,
  ConfidencePill,
  SourcePill,
  type Confidence,
  type Source,
} from "@/components/ai/AIPrimitives";

type Phase = "input" | "thinking" | "results";

type Match = {
  id: string;
  partNumber: string;
  description: string;
  vendor: string;
  price: number;
  stockCount: number;
  stockLocation: string;
  confidence: Confidence;
  confidencePercent: number;
  sources: Source[];
  reasoning: string;
};

const HERO_MATCHES: Match[] = [
  {
    id: "m1",
    partNumber: "WHN-VTX-AMB",
    description: "Whelen Vertex amber LED marker - surface mount",
    vendor: "Worldpac",
    price: 42.5,
    stockCount: 6,
    stockLocation: "Worldpac Jax hub · 1.5 hrs",
    confidence: "high",
    confidencePercent: 96,
    sources: ["shop-history", "worldpac"],
    reasoning:
      "Photo matches the Whelen Vertex amber-pattern marker light. Your shop replaced 4 of these on similar E-450 ambulances this year, all from Worldpac at $42.50. Photo features: round bezel, amber lens, 4-pin connector visible.",
  },
  {
    id: "m2",
    partNumber: "WHN-VTX-CLR",
    description: "Whelen Vertex amber LED marker - flush mount",
    vendor: "Worldpac",
    price: 38.9,
    stockCount: 2,
    stockLocation: "Worldpac Jax hub · 1.5 hrs",
    confidence: "medium",
    confidencePercent: 71,
    sources: ["worldpac", "ai-inferred"],
    reasoning:
      "Flush-mount variant of the same Whelen Vertex line. Cheaper but requires recess in the body - confirm mount style before ordering.",
  },
  {
    id: "m3",
    partNumber: "BTLT-AM55",
    description: "Buyers Products 5.5\" amber marker LED",
    vendor: "NAPA",
    price: 24.99,
    stockCount: 12,
    stockLocation: "NAPA Phillips Hwy · 30 min",
    confidence: "low",
    confidencePercent: 48,
    sources: ["napa", "ai-inferred"],
    reasoning:
      "Generic alternative - cheaper but not OEM ambulance grade. Your shop has not used this part on Med Trust vehicles before. Color/lens shape similar but durability rating lower (IP65 vs IP67 on Whelen).",
  },
];

const THINKING_STEPS = [
  "Reading image - extracting part features",
  "Matching against 12,000 vendor parts",
  "Filtering for 2019 Ford E-450 fitment",
  "Cross-referencing your shop's purchase history",
  "Pulling live stock + pricing from 3 vendors",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PartsIdentifierModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [step, setStep] = useState(0);
  const [vinFilter, setVinFilter] = useState("");
  const [partClass, setPartClass] = useState("All parts");

  useEffect(() => {
    if (open) {
      setPhase("input");
      setStep(0);
      setVinFilter("");
      setPartClass("All parts");
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "thinking") return;
    if (step < THINKING_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("results"), 350);
    return () => clearTimeout(t);
  }, [open, phase, step]);

  const startAnalysis = () => {
    setStep(0);
    setPhase("thinking");
  };

  const orderPart = (match: Match) => {
    toast.success(`Added ${match.description} to parts order`, {
      description: `${match.vendor} · ${match.partNumber} · $${match.price.toFixed(2)}`,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Parts Identifier"
      description={
        phase === "input"
          ? "Snap a photo or scan VIN - AI returns exact part matches with stock"
          : phase === "thinking"
            ? "Analyzing…"
            : "3 matches found"
      }
      size="lg"
    >
      {phase === "input" && (
        <div className="py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Photo option */}
            <button
              type="button"
              onClick={startAnalysis}
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-background p-6 transition-all hover:border-brand-green hover:bg-brand-green-tint"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-tint">
                <Camera className="h-6 w-6 text-brand-green-soft" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Snap a photo</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  AI identifies from the housing, label, or part number visible
                </div>
              </div>
            </button>

            {/* Upload option */}
            <button
              type="button"
              onClick={startAnalysis}
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-background p-6 transition-all hover:border-brand-green hover:bg-brand-green-tint"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-tint">
                <Upload className="h-6 w-6 text-brand-green-soft" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Upload from device</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Or paste a part number / Baldwin code
                </div>
              </div>
            </button>
          </div>

          {/* Manual entry */}
          <div className="mt-4 rounded-md border border-border bg-surface/30 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Or filter by vehicle (VIN narrowing)
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={vinFilter}
                onChange={(e) => setVinFilter(e.target.value)}
                placeholder="VIN - e.g., 1FDXE4FS7KDC42718"
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
              <select
                value={partClass}
                onChange={(e) => setPartClass(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              >
                <option>All parts</option>
                <option>Filters</option>
                <option>Lighting</option>
                <option>Brakes</option>
                <option>Suspension</option>
              </select>
              <button
                type="button"
                onClick={startAnalysis}
                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "thinking" && (
        <AIThinkingPanel steps={THINKING_STEPS} currentStep={step} />
      )}

      {phase === "results" && (
        <div className="space-y-3">
          {/* Image thumbnail at top */}
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface/30 p-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background">
              <Camera className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold">Analyzed image</div>
              <div className="text-[10px] text-muted-foreground">
                Identified: round bezel · amber lens · 4-pin connector · 12V LED marker
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhase("input")}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Re-scan
            </button>
          </div>

          {/* Match list */}
          <div className="space-y-2">
            {HERO_MATCHES.map((m, idx) => (
              <div
                key={m.id}
                className={clsx(
                  "rounded-lg border bg-background p-3 transition-colors",
                  idx === 0
                    ? "border-brand-green/40 bg-brand-green-tint/30"
                    : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        {idx === 0 && (
                          <span className="rounded-full bg-brand-green px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-green-foreground">
                            Best match
                          </span>
                        )}
                        <span className="text-sm font-semibold">{m.description}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">{m.partNumber}</span>
                        <span>·</span>
                        <span>{m.vendor}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <ConfidencePill
                          confidence={m.confidence}
                          percent={m.confidencePercent}
                        />
                        {m.sources.map((s) => (
                          <SourcePill key={s} source={s} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums">
                      ${m.price.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <Truck className="h-2.5 w-2.5" />
                      {m.stockCount} in stock
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
                  <p className="flex-1 text-[10px] leading-relaxed text-muted-foreground">
                    {m.reasoning}
                  </p>
                  <button
                    type="button"
                    onClick={() => orderPart(m)}
                    className={clsx(
                      "inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold",
                      idx === 0
                        ? "bg-brand-green text-brand-green-foreground hover:opacity-90"
                        : "border border-border bg-background hover:bg-surface",
                    )}
                  >
                    <Check className="h-3 w-3" />
                    Add to order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
