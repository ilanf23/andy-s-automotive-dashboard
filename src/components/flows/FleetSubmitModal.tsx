import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Send,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { AIThinkingPanel, SourcePill, AIBubble } from "@/components/ai/AIPrimitives";

type Phase = "preview" | "mapping" | "submitting" | "success";

const MAPPING = [
  { ours: "Front brake job - pads + rotor turn", theirs: "Brake Service · BR-001 · category 14", note: "Auto-mapped from job code" },
  { ours: "Driver-side rear marker light LED", theirs: "Lighting Repair · LT-007 · category 22", note: "Matches Whelen Vertex SKU" },
  { ours: "Cabin air filter replacement", theirs: "Preventive Maintenance · PM-CAB · category 9", note: "Standard PM line" },
  { ours: "Rear ABS sensor (LH)", theirs: "Electrical · EL-022 · category 18", note: "Mapped by part class" },
];

const MAPPING_STEPS = [
  "Reading Fleetio's customer schema for Med Trust",
  "Matching your 4 estimate lines to Fleetio job codes",
  "Applying Med Trust's negotiated labor rate ($138/hr)",
  "Validating estimate against their approval threshold",
  "Generating submission payload",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  platform?: "Fleetio" | "Holman" | "Enterprise" | "Mike Albert's";
};

export function FleetSubmitModal({
  open,
  onOpenChange,
  estimateId = "EST-4847",
  platform = "Fleetio",
}: Props) {
  const [phase, setPhase] = useState<Phase>("preview");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setPhase("preview");
      setStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "mapping") return;
    if (step < MAPPING_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("submitting"), 350);
    return () => clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== "submitting") return;
    const t = setTimeout(() => setPhase("success"), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => {
      toast.success(`${estimateId} submitted to ${platform}`, {
        description: "Med Trust dispatch notified - awaiting fleet manager approval",
      });
      onOpenChange(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [phase, estimateId, platform, onOpenChange]);

  const submit = () => {
    setStep(0);
    setPhase("mapping");
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (phase !== "preview") return;
        onOpenChange(o);
      }}
      title={`Submit to ${platform}`}
      description={
        phase === "preview"
          ? `Auto-map your estimate to ${platform}'s schema and submit`
          : phase === "mapping"
            ? "AI is mapping line items…"
            : phase === "submitting"
              ? `Sending to ${platform}…`
              : "Submitted"
      }
      size="lg"
      footer={
        phase === "preview" ? (
          <>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Send className="h-3 w-3" />
              Map & submit
            </button>
          </>
        ) : null
      }
    >
      {phase === "preview" && (
        <div className="space-y-4">
          {/* Platform card */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent text-xl font-bold text-accent-foreground">
                {platform[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{platform}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-bold text-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                    Connected
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Authorized for Med Trust account · last sync 2 min ago
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(`Opening ${platform}…`);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
              >
                Open in {platform}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Auto-mapping preview */}
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <AIBubble>AI Auto-Mapped</AIBubble>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  4 lines · 100% mapped
                </span>
              </div>
              <SourcePill source="fleetio" />
            </div>
            <div className="divide-y divide-border">
              {MAPPING.map((m, i) => (
                <div key={i} className="grid grid-cols-[1fr_24px_1fr] items-center gap-2 px-4 py-2.5">
                  <div>
                    <div className="text-xs font-semibold">{m.ours}</div>
                    <div className="text-[10px] text-muted-foreground">Andy's OS</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs font-medium">{m.theirs}</div>
                    <div className="text-[10px] text-brand-green-soft">{m.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiated rate banner */}
          <div className="rounded-md border border-brand-green/30 bg-brand-green-tint p-3">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-soft" />
              <div>
                <p className="text-xs font-semibold text-brand-green-soft">
                  Med Trust's negotiated rate applied: $138/hr (vs your shop default $148/hr)
                </p>
                <p className="mt-0.5 text-[10px] text-brand-green-soft/80">
                  This is the rate on their master service agreement. AI applied automatically - no manual override needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "mapping" && (
        <AIThinkingPanel steps={MAPPING_STEPS} currentStep={step} />
      )}

      {phase === "submitting" && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/30" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Pushing to {platform} via API…</p>
        </div>
      )}

      {phase === "success" && (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <div className="text-center">
            <div className="text-base font-semibold">Submitted to {platform}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Med Trust will receive it in their inbox within 60 seconds
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
