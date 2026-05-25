import { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Check, AlertTriangle, Camera, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { AIBubble } from "@/components/ai/AIPrimitives";

type Phase = "idle" | "listening" | "transcribing" | "parsed";

// Hand-crafted "transcripts" that stream in word-by-word
const DEMO_TRANSCRIPT_FRAGMENTS = [
  "front",
  "front brake",
  "front brake pads",
  "front brake pads MT-47",
  "front brake pads MT-47, two millimeters",
  "front brake pads MT-47, two millimeters passenger side",
  "front brake pads MT-47, two millimeters passenger side, metal-on-metal driver",
  "front brake pads MT-47, two millimeters passenger side, metal-on-metal driver side, photo coming",
];

// What the AI extracts from the transcript
const PARSED = {
  category: "Brakes",
  itemName: "Brake pads — front",
  severity: "red" as const,
  notes: "2mm passenger side, metal-on-metal driver side — replace immediately",
  needsPhoto: true,
};

export function VoiceToInspection() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fragmentIdx, setFragmentIdx] = useState(0);

  // Stream transcript fragments during "listening"
  useEffect(() => {
    if (phase !== "listening") return;
    if (fragmentIdx < DEMO_TRANSCRIPT_FRAGMENTS.length - 1) {
      const t = setTimeout(() => setFragmentIdx((i) => i + 1), 280);
      return () => clearTimeout(t);
    }
    // Done streaming — show "transcribing" briefly then "parsed"
    const t = setTimeout(() => setPhase("transcribing"), 400);
    return () => clearTimeout(t);
  }, [phase, fragmentIdx]);

  useEffect(() => {
    if (phase !== "transcribing") return;
    const t = setTimeout(() => setPhase("parsed"), 700);
    return () => clearTimeout(t);
  }, [phase]);

  const startListening = () => {
    setFragmentIdx(0);
    setPhase("listening");
    setOpen(true);
  };

  const stopListening = () => {
    setPhase("transcribing");
  };

  const acceptFinding = () => {
    toast.success("Finding added to inspection", {
      description: `${PARSED.category} · ${PARSED.itemName} · RED · awaiting photo`,
    });
    setOpen(false);
    setPhase("idle");
    setFragmentIdx(0);
  };

  const close = () => {
    setOpen(false);
    setPhase("idle");
    setFragmentIdx(0);
  };

  return (
    <>
      {/* Trigger button — goes anywhere in inspection UI */}
      <button
        type="button"
        onClick={startListening}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/40 bg-brand-green-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand-green-soft transition-colors hover:bg-brand-green/20"
        title="Voice-to-Inspection — speak findings hands-free"
      >
        <Mic className="h-3 w-3" />
        Voice finding
      </button>

      {/* Floating panel — appears bottom-right while active */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] rounded-lg border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <AIBubble>Voice-to-Inspection</AIBubble>
              {phase === "listening" && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-destructive">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                  Listening
                </span>
              )}
              {phase === "transcribing" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Parsing…
                </span>
              )}
              {phase === "parsed" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green-soft">
                  <Check className="h-3 w-3" />
                  Ready
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Transcript */}
            <div className="rounded-md border border-border bg-surface/30 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Transcript
              </div>
              <p className="mt-1.5 text-xs leading-relaxed">
                {phase === "idle" || (phase === "listening" && fragmentIdx === 0)
                  ? <span className="text-muted-foreground italic">Speak now…</span>
                  : (
                    <>
                      {DEMO_TRANSCRIPT_FRAGMENTS[fragmentIdx]}
                      {phase === "listening" && (
                        <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-foreground" />
                      )}
                    </>
                  )}
              </p>
            </div>

            {/* Parsed result */}
            {phase === "parsed" && (
              <div className="mt-3 rounded-lg border border-brand-green/30 bg-brand-green-tint p-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-brand-green-soft" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green-soft">
                    AI parsed → inspection finding
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  <Row label="Category" value={PARSED.category} />
                  <Row label="Item" value={PARSED.itemName} />
                  <Row
                    label="Severity"
                    value={
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[9px] font-bold uppercase text-destructive-foreground">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Red
                      </span>
                    }
                  />
                  <Row label="Notes" value={PARSED.notes} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-4 py-2">
            {phase === "listening" && (
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
              >
                <MicOff className="h-3 w-3" />
                Stop & parse
              </button>
            )}
            {phase === "parsed" && (
              <>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:bg-surface"
                >
                  Discard
                </button>
                <div className="flex items-center gap-2">
                  {PARSED.needsPhoto && (
                    <button
                      type="button"
                      onClick={acceptFinding}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
                    >
                      <Camera className="h-3 w-3" />
                      Add + photo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={acceptFinding}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-brand-green-foreground hover:opacity-90"
                  >
                    <Check className="h-3 w-3" />
                    File finding
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-[11px]">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
