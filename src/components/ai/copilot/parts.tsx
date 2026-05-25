import {
  Sparkles,
  Check,
  X,
  Code2,
  ChevronDown,
  ChevronUp,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import type { MessagePart, ApprovalPreview, ResultCard, ResultRow } from "./types";

// ============================================================================
// Renderer for a single message part
// ============================================================================

export function PartRenderer({
  part,
  onApprove,
  onReject,
  onSuggestion,
}: {
  part: MessagePart;
  onApprove?: (partId: string) => void;
  onReject?: (partId: string) => void;
  onSuggestion?: (prompt: string) => void;
}) {
  if (part.kind === "text") return <TextPart text={part.text} streaming={part.streaming} />;
  if (part.kind === "reasoning") return <ReasoningPart intro={part.intro} steps={part.steps} currentStep={part.currentStep} />;
  if (part.kind === "tool") return <ToolPart part={part} />;
  if (part.kind === "approval") {
    return (
      <ApprovalPart
        partId={part.id}
        preview={part.preview}
        status={part.status}
        onApprove={() => onApprove?.(part.id)}
        onReject={() => onReject?.(part.id)}
      />
    );
  }
  if (part.kind === "result") return <ResultPart card={part.card} />;
  if (part.kind === "suggestions") {
    return (
      <SuggestionsPart
        prompts={part.prompts}
        onSuggestion={(p) => onSuggestion?.(p)}
      />
    );
  }
  return null;
}

// ============================================================================
// Text — plain (possibly streaming) text
// ============================================================================

function TextPart({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <p className="text-[13px] leading-relaxed">
      {text}
      {streaming && (
        <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-foreground align-middle" />
      )}
    </p>
  );
}

// ============================================================================
// Reasoning — collapsible "thinking" block
// ============================================================================

function ReasoningPart({
  intro,
  steps,
  currentStep,
}: {
  intro?: string;
  steps: string[];
  currentStep: number;
}) {
  const allDone = currentStep >= steps.length;
  return (
    <div className="rounded-md border border-border bg-surface/40 p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-brand-green-soft" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {allDone ? "Reasoning" : "Thinking…"}
        </span>
      </div>
      {intro && <p className="mt-1.5 text-[11px] text-foreground/85">{intro}</p>}
      <ul className="mt-2 space-y-1">
        {steps.map((s, i) => {
          const done = i < currentStep;
          const current = i === currentStep;
          return (
            <li
              key={i}
              className={clsx(
                "flex items-start gap-2 text-[11px] transition-opacity",
                !done && !current && "opacity-40",
              )}
            >
              <span
                className={clsx(
                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                  done && "bg-brand-green text-brand-green-foreground",
                  current && "bg-foreground text-background",
                  !done && !current && "border border-border",
                )}
              >
                {done ? (
                  <Check className="h-2 w-2" strokeWidth={3} />
                ) : current ? (
                  <span className="h-1 w-1 animate-pulse rounded-full bg-background" />
                ) : null}
              </span>
              <span className={clsx(done && "text-brand-green-soft")}>{s}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================================
// Tool call card — looks like a real agentic tool invocation
// ============================================================================

function ToolPart({
  part,
}: {
  part: Extract<MessagePart, { kind: "tool" }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const argsString = JSON.stringify(part.args, null, 2);
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-md border bg-background transition-all",
        part.status === "running"
          ? "border-foreground/30"
          : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-surface/40"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={clsx(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded",
              part.status === "running"
                ? "bg-foreground text-background"
                : "bg-brand-green text-brand-green-foreground",
            )}
          >
            {part.status === "running" ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-background" />
            ) : (
              <Code2 className="h-3 w-3" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <code className="truncate font-mono text-[11px] font-semibold">
                {part.tool}
              </code>
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  part.status === "running"
                    ? "bg-surface text-foreground"
                    : "bg-brand-green-tint text-brand-green-soft",
                )}
              >
                {part.status === "running" ? "Running" : "Done"}
              </span>
            </div>
            {part.status === "done" && part.result && (
              <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {part.result}
              </div>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border bg-surface/30 px-3 py-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Arguments
          </div>
          <pre className="mt-1 overflow-x-auto rounded bg-background p-1.5 font-mono text-[10px] leading-relaxed">
            {argsString}
          </pre>
          {part.result && (
            <>
              <div className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Result
              </div>
              <pre className="mt-1 overflow-x-auto rounded bg-background p-1.5 font-mono text-[10px] leading-relaxed">
                {part.result}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Approval card — human-in-the-loop pause
// ============================================================================

function ApprovalPart({
  partId,
  preview,
  status,
  onApprove,
  onReject,
}: {
  partId: string;
  preview: ApprovalPreview;
  status: "pending" | "approved" | "rejected";
  onApprove: () => void;
  onReject: () => void;
}) {
  const toneClasses: Record<string, string> = {
    default: "border-foreground/30 bg-surface/40",
    success: "border-brand-green/40 bg-brand-green-tint",
    danger: "border-destructive/30 bg-destructive/5",
  };
  const tone = preview.tone ?? "default";

  return (
    <div className={clsx("overflow-hidden rounded-lg border-2", toneClasses[tone])}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              tone === "danger"
                ? "bg-destructive text-destructive-foreground"
                : tone === "success"
                  ? "bg-brand-green text-brand-green-foreground"
                  : "bg-foreground text-background",
            )}
          >
            {tone === "danger" ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
          </div>
          <div>
            <span
              className={clsx(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                tone === "danger"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-foreground text-background",
              )}
            >
              Approval required
            </span>
          </div>
        </div>

        <h3 className="mt-2.5 text-sm font-semibold">{preview.title}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">
          {preview.description}
        </p>

        {preview.details && (
          <div className="mt-3 rounded-md border border-border bg-background">
            {preview.details.map((d, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 border-b border-border px-3 py-1.5 text-[11px] last:border-b-0"
              >
                <span className="text-muted-foreground">{d.label}</span>
                <span
                  className={clsx(
                    "text-right font-semibold",
                    d.mono && "font-mono text-[10px]",
                  )}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {preview.body && (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-border bg-background p-3 font-mono text-[10px] leading-relaxed text-foreground/85 whitespace-pre-wrap">
            {preview.body}
          </div>
        )}

        {preview.impact && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
            <TrendingUp className="h-3 w-3 text-brand-green-soft" />
            <span className="text-brand-green-soft">{preview.impact}</span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-2 border-t border-border bg-background/80 px-4 py-2.5">
        {status === "pending" ? (
          <>
            <button
              type="button"
              onClick={onReject}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-semibold hover:bg-surface"
            >
              <X className="h-3 w-3" />
              Reject
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-semibold hover:bg-surface"
            >
              Modify
            </button>
            <button
              type="button"
              onClick={onApprove}
              className={clsx(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold",
                tone === "danger"
                  ? "bg-destructive text-destructive-foreground hover:opacity-90"
                  : "bg-brand-green text-brand-green-foreground hover:opacity-90",
              )}
            >
              <Check className="h-3 w-3" />
              Approve
            </button>
          </>
        ) : (
          <div
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              status === "approved"
                ? "bg-brand-green-tint text-brand-green-soft"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {status === "approved" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Result card — structured response
// ============================================================================

function ResultPart({ card }: { card: ResultCard }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="border-b border-border bg-surface/40 px-3 py-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {card.title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {card.rows.map((r, i) => (
          <ResultRowItem key={i} row={r} />
        ))}
      </div>
      {card.footer && (
        <div className="border-t border-border bg-surface/30 px-3 py-2 text-[10px] italic text-muted-foreground">
          {card.footer}
        </div>
      )}
    </div>
  );
}

function ResultRowItem({ row }: { row: ResultRow }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs font-semibold">{row.label}</div>
        {row.sub && (
          <div className="mt-0.5 text-[10px] text-muted-foreground">{row.sub}</div>
        )}
      </div>
      <div
        className={clsx(
          "shrink-0 text-right text-xs font-semibold tabular-nums",
          row.tone === "success" && "text-brand-green-soft",
          row.tone === "warning" && "text-[#991B1B]",
          row.tone === "danger" && "text-destructive",
        )}
      >
        {row.value}
      </div>
    </div>
  );
}

// ============================================================================
// Suggestion chips — clickable follow-up prompts
// ============================================================================

function SuggestionsPart({
  prompts,
  onSuggestion,
}: {
  prompts: string[];
  onSuggestion?: (prompt: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Try
      </div>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onSuggestion?.(p)}
            className="group flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-[11px] font-medium transition-colors hover:border-brand-green hover:bg-brand-green-tint"
          >
            <span>{p}</span>
            <Sparkles className="h-2.5 w-2.5 shrink-0 text-muted-foreground group-hover:text-brand-green-soft" />
          </button>
        ))}
      </div>
    </div>
  );
}
