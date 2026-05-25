import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, RefreshCcw, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PartRenderer } from "./parts";
import type { Message, MessagePart, ApprovalPreview, ContextEntity } from "./types";
import { copilotChatServerFn } from "@/lib/copilot-server";
import { TOOLS, buildSnapshot } from "@/lib/copilot-tools-client";
import { TOOL_META, type ChatMessage } from "@/lib/copilot-tools";

// ============================================================================
// Helpers
// ============================================================================

let _id = 0;
const newId = () => `id-${++_id}-${Date.now()}`;

// Maximum number of tool-call iterations per user turn. Prevents runaway loops
// if the model keeps calling tools forever.
const MAX_TOOL_ITERATIONS = 10;

// Render the args dict as a list of approval-card detail rows.
function argsToDetails(args: Record<string, unknown>): ApprovalPreview["details"] {
  return Object.entries(args).map(([label, value]) => ({
    label,
    value:
      typeof value === "string"
        ? value
        : typeof value === "number"
          ? String(value)
          : JSON.stringify(value),
    mono: typeof value !== "string" && typeof value !== "number",
  }));
}

function buildApprovalPreview(
  toolName: string,
  args: Record<string, unknown>,
): ApprovalPreview {
  const meta = TOOL_META[toolName];
  return {
    title: meta?.title ?? toolName,
    description: `The AI wants to run \`${toolName}\`. Review the arguments below and approve to execute.`,
    details: argsToDetails(args),
    tone: meta?.tone ?? "default",
  };
}

// ============================================================================
// CopilotChat
// ============================================================================

type Props = {
  onContextChange?: (ctx: ContextEntity | null) => void;
};

export function CopilotChat({ onContextChange }: Props) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Promise resolver for an approval card that's currently waiting on the user.
  const pendingApprovalRef = useRef<{
    partId: string;
    resolve: (approved: boolean) => void;
  } | null>(null);

  // Raw OpenAI-format conversation history, separate from the UI Message[]
  // because each user/assistant turn may map to several UI parts.
  const apiMessagesRef = useRef<ChatMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Tell the parent route that context changed (used by the right-rail panel).
  // The real copilot doesn't push entity context — just leave it null for now.
  useEffect(() => {
    onContextChange?.(null);
  }, [onContextChange]);

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

  const appendPart = useCallback((messageId: string, part: MessagePart) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId ? m : { ...m, parts: [...m.parts, part] },
      ),
    );
  }, []);

  // ----- approval bridge -------------------------------------------------

  const requestApproval = useCallback(
    (assistantId: string, toolName: string, args: Record<string, unknown>) => {
      const partId = newId();
      appendPart(assistantId, {
        kind: "approval",
        id: partId,
        preview: buildApprovalPreview(toolName, args),
        status: "pending",
      });
      return new Promise<{ partId: string; approved: boolean }>((resolve) => {
        pendingApprovalRef.current = {
          partId,
          resolve: (approved) => resolve({ partId, approved }),
        };
      });
    },
    [appendPart],
  );

  const handleApprove = useCallback((partId: string) => {
    const pending = pendingApprovalRef.current;
    if (pending && pending.partId === partId) {
      pendingApprovalRef.current = null;
      pending.resolve(true);
    }
  }, []);

  const handleReject = useCallback((partId: string) => {
    const pending = pendingApprovalRef.current;
    if (pending && pending.partId === partId) {
      pendingApprovalRef.current = null;
      pending.resolve(false);
    }
  }, []);

  // ----- public actions --------------------------------------------------

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || busy) return;
      const trimmed = text.trim();

      // 1. Push the user turn into both the UI and the API history
      const userMsg: Message = {
        id: newId(),
        role: "user",
        parts: [{ kind: "text", id: newId(), text: trimmed }],
        timestamp: Date.now(),
      };
      appendMessage(userMsg);
      apiMessagesRef.current.push({ role: "user", content: trimmed });
      setInput("");
      setBusy(true);

      // 2. Create the assistant container that we'll stream parts into
      const assistantId = newId();
      appendMessage({
        id: assistantId,
        role: "assistant",
        parts: [],
        timestamp: Date.now(),
      });

      try {
        let iter = 0;
        // Tool-calling loop — keep round-tripping until the model stops
        // requesting tools or we hit the safety limit.
        while (iter++ < MAX_TOOL_ITERATIONS) {
          const snapshot = buildSnapshot();
          const response = await copilotChatServerFn({
            data: { messages: apiMessagesRef.current, snapshot },
          });
          const choice = response.choices[0];
          if (!choice) {
            appendPart(assistantId, {
              kind: "text",
              id: newId(),
              text: "(no response)",
            });
            break;
          }
          const msg = choice.message;

          // Render any text content the model produced
          if (msg.content) {
            appendPart(assistantId, {
              kind: "text",
              id: newId(),
              text: msg.content,
            });
          }

          // Push the assistant message into API history exactly as received
          apiMessagesRef.current.push({
            role: "assistant",
            content: msg.content,
            tool_calls: msg.tool_calls,
          });

          // If no tool calls, we're done with this user turn
          if (!msg.tool_calls?.length) break;

          // Execute each tool call (with approval gate for write tools)
          for (const call of msg.tool_calls) {
            const toolName = call.function.name;
            const tool = TOOLS[toolName];
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function.arguments || "{}");
            } catch {
              args = {};
            }

            if (!tool) {
              apiMessagesRef.current.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
              });
              continue;
            }

            // Show the tool-call card immediately so users see what's running
            const toolPartId = newId();
            appendPart(assistantId, {
              kind: "tool",
              id: toolPartId,
              tool: toolName,
              args,
              status: "running",
            });

            // Approval gate for write tools
            if (tool.requiresApproval) {
              const { partId, approved } = await requestApproval(
                assistantId,
                toolName,
                args,
              );
              updatePart(assistantId, partId, (p) =>
                p.kind === "approval"
                  ? { ...p, status: approved ? "approved" : "rejected" }
                  : p,
              );
              if (!approved) {
                updatePart(assistantId, toolPartId, (p) =>
                  p.kind === "tool"
                    ? { ...p, status: "done", result: "Rejected by user" }
                    : p,
                );
                apiMessagesRef.current.push({
                  role: "tool",
                  tool_call_id: call.id,
                  content: JSON.stringify({
                    error: "User rejected this action.",
                  }),
                });
                continue;
              }
            }

            // Execute
            try {
              const result = await tool.execute(args, {
                navigate: (path: string) => navigate({ to: path }),
              });
              const resultStr = JSON.stringify(result);
              updatePart(assistantId, toolPartId, (p) =>
                p.kind === "tool"
                  ? {
                      ...p,
                      status: "done",
                      result: resultStr.length > 200
                        ? resultStr.slice(0, 200) + "…"
                        : resultStr,
                    }
                  : p,
              );
              apiMessagesRef.current.push({
                role: "tool",
                tool_call_id: call.id,
                content: resultStr,
              });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              updatePart(assistantId, toolPartId, (p) =>
                p.kind === "tool"
                  ? { ...p, status: "done", result: `Error: ${msg}` }
                  : p,
              );
              apiMessagesRef.current.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify({ error: msg }),
              });
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        appendPart(assistantId, {
          kind: "text",
          id: newId(),
          text: `Sorry — I hit an error: ${msg}`,
        });
        toast.error("Copilot error", { description: msg });
      } finally {
        setBusy(false);
      }
    },
    [busy, appendMessage, appendPart, updatePart, requestApproval, navigate],
  );

  const handleReset = useCallback(() => {
    setMessages([]);
    apiMessagesRef.current = [];
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
              Powered by GPT-4o · full read/write tools · approvals on writes
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
        "Create a new RO for Med Trust on MT-47 — brake job complaint",
        "Mark RO 4847 as ready for pickup",
        "Take a $1,500 ACH payment from City Form on RO 4842",
      ],
    },
    {
      group: "Answer questions",
      items: [
        "What's on my plate today?",
        "Show me my top 5 customers by lifetime value",
        "Why is RO 4847 still in the shop?",
        "Which ROs are awaiting approval right now?",
      ],
    },
    {
      group: "Help me work",
      items: [
        "Open RO 4847",
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
