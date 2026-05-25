import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, RefreshCcw, User } from "lucide-react";
import clsx from "clsx";
import { PartRenderer } from "./parts";
import { matchScenario, FALLBACK_STEPS } from "./scenarios";
import type {
  Message,
  MessagePart,
  ScenarioStep,
  ContextEntity,
} from "./types";

// ============================================================================
// Helpers
// ============================================================================

let _id = 0;
const newId = () => `id-${++_id}-${Date.now()}`;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ============================================================================
// CopilotChat
// ============================================================================

type Props = {
  onContextChange?: (ctx: ContextEntity | null) => void;
};

export function CopilotChat({ onContextChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // When a scenario is paused at an approval step, the resolver resumes execution
  const pendingApprovalRef = useRef<{
    partId: string;
    resolve: (approved: boolean) => void;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // ----- low-level state mutators ---------------------------------------

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updatePart = useCallback(
    (messageId: string, partId: string, updater: (p: MessagePart) => MessagePart) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id !== messageId
            ? m
            : {
                ...m,
                parts: m.parts.map((p) => (p.id === partId ? updater(p) : p)),
              },
        ),
      );
    },
    [],
  );

  const appendPart = useCallback(
    (messageId: string, part: MessagePart) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id !== messageId ? m : { ...m, parts: [...m.parts, part] },
        ),
      );
    },
    [],
  );

  // ----- step executors --------------------------------------------------

  const runSteps = useCallback(
    async (assistantId: string, steps: ScenarioStep[]) => {
      for (const step of steps) {
        if (step.type === "pause") {
          await wait(step.ms);
          continue;
        }

        if (step.type === "text") {
          const part: MessagePart = { kind: "text", id: newId(), text: step.text };
          appendPart(assistantId, part);
          await wait(step.streamMs ?? 350);
        }

        if (step.type === "reasoning") {
          const partId = newId();
          appendPart(assistantId, {
            kind: "reasoning",
            id: partId,
            intro: step.intro,
            steps: step.steps,
            currentStep: 0,
          });
          for (let i = 1; i <= step.steps.length; i++) {
            await wait(step.stepMs ?? 280);
            updatePart(assistantId, partId, (p) =>
              p.kind === "reasoning" ? { ...p, currentStep: i } : p,
            );
          }
          await wait(200);
        }

        if (step.type === "tool") {
          const partId = newId();
          appendPart(assistantId, {
            kind: "tool",
            id: partId,
            tool: step.tool,
            args: step.args,
            status: "running",
          });
          await wait(step.durationMs ?? 700);
          updatePart(assistantId, partId, (p) =>
            p.kind === "tool"
              ? { ...p, status: "done", result: step.result }
              : p,
          );
          await wait(200);
        }

        if (step.type === "result") {
          appendPart(assistantId, {
            kind: "result",
            id: newId(),
            card: step.card,
          });
          await wait(300);
        }

        if (step.type === "suggestions") {
          appendPart(assistantId, {
            kind: "suggestions",
            id: newId(),
            prompts: step.prompts,
          });
          await wait(200);
        }

        if (step.type === "approval") {
          const partId = newId();
          appendPart(assistantId, {
            kind: "approval",
            id: partId,
            preview: step.preview,
            status: "pending",
          });
          const approved = await new Promise<boolean>((resolve) => {
            pendingApprovalRef.current = { partId, resolve };
          });
          pendingApprovalRef.current = null;
          updatePart(assistantId, partId, (p) =>
            p.kind === "approval"
              ? { ...p, status: approved ? "approved" : "rejected" }
              : p,
          );
          await wait(300);
          const nextSteps = approved ? step.onApproved : (step.onRejected ?? []);
          await runSteps(assistantId, nextSteps);
        }
      }
    },
    [appendPart, updatePart],
  );

  // ----- public actions --------------------------------------------------

  const handleApprove = useCallback((partId: string) => {
    const pending = pendingApprovalRef.current;
    if (pending && pending.partId === partId) {
      pending.resolve(true);
    }
  }, []);

  const handleReject = useCallback((partId: string) => {
    const pending = pendingApprovalRef.current;
    if (pending && pending.partId === partId) {
      pending.resolve(false);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      const trimmed = text.trim();
      const userMsg: Message = {
        id: newId(),
        role: "user",
        parts: [{ kind: "text", id: newId(), text: trimmed }],
        timestamp: Date.now(),
      };
      appendMessage(userMsg);
      setInput("");
      setBusy(true);

      // Brief "thinking" delay before assistant message appears
      await wait(450);

      const scenario = matchScenario(trimmed);
      const steps = scenario ? scenario.steps : FALLBACK_STEPS;
      const assistantId = newId();
      appendMessage({
        id: assistantId,
        role: "assistant",
        parts: [],
        timestamp: Date.now(),
      });

      if (scenario?.context) {
        onContextChange?.(scenario.context);
      }

      await runSteps(assistantId, steps);
      setBusy(false);
    },
    [busy, appendMessage, runSteps, onContextChange],
  );

  const handleReset = useCallback(() => {
    setMessages([]);
    pendingApprovalRef.current?.resolve(false);
    pendingApprovalRef.current = null;
    setBusy(false);
    onContextChange?.(null);
  }, [onContextChange]);

  // ----- render ---------------------------------------------------------

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Copilot</h2>
            <p className="text-[10px] text-muted-foreground">
              Full read + write access · approves every customer-facing or money action with you
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-surface"
        >
          <RefreshCcw className="h-3 w-3" />
          New chat
        </button>
      </div>

      {/* Body — message list */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface/30 px-4 py-5">
        {!hasMessages && <EmptyState onPick={handleSend} />}
        {hasMessages && (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuggestion={handleSend}
              />
            ))}
            {busy && !pendingApprovalRef.current && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-border bg-background px-3.5 py-2 text-[13px]">
                  <span className="inline-flex gap-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-2 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              disabled={busy}
              rows={1}
              placeholder="Ask anything, or tell me to take an action…"
              className="flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={busy || !input.trim()}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-green px-3 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              Send
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[10px] text-muted-foreground">
            <span>Press Enter to send · Shift+Enter for newline</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Demo mode — outputs hand-crafted, behavior matches production
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Empty state — first-load suggestions
// ============================================================================

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const examples = [
    {
      group: "Take action",
      items: [
        "Give me an estimate for the brake job on MT-47 and send it to Med Trust",
        "Schedule Reliable Ducks for next Tuesday at 10am",
        "Send Northpoint a demand letter for the $17k past due",
      ],
    },
    {
      group: "Answer questions",
      items: [
        "Show me my top 5 customers by lifetime value",
        "What's my real labor GP this week using hourly pay?",
        "Why is RO 4847 stuck?",
        "What's at risk of churning this month?",
      ],
    },
    {
      group: "Help me work",
      items: [
        "Find me parts for the front brake job on MT-47",
        "What can you do?",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          Hey Cameron — what's on your plate today?
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          I have full read access to your shop. Anything that costs money or touches a customer, I'll pause and ask you first.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {examples.map((g) => (
          <div key={g.group}>
            <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.group}
            </div>
            <div className="space-y-1.5">
              {g.items.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPick(p)}
                  className="group flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-[12px] font-medium transition-colors hover:border-brand-green hover:bg-brand-green-tint"
                >
                  <span>{p}</span>
                  <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-brand-green-soft" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MessageRow — renders a single conversation turn
// ============================================================================

function MessageRow({
  message,
  onApprove,
  onReject,
  onSuggestion,
}: {
  message: Message;
  onApprove: (partId: string) => void;
  onReject: (partId: string) => void;
  onSuggestion: (text: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3.5 py-2 text-[13px] leading-relaxed text-background">
          {message.parts.map((p) => (
            <PartRenderer key={p.id} part={p} />
          ))}
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface">
          <User className="h-3.5 w-3.5 text-foreground" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        {message.parts.map((p) => (
          <PartRenderer
            key={p.id}
            part={p}
            onApprove={onApprove}
            onReject={onReject}
            onSuggestion={onSuggestion}
          />
        ))}
      </div>
    </div>
  );
}
