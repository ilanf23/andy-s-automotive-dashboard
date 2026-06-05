import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, User } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { AIBubble } from "@/components/ai/AIPrimitives";

type Message = {
  id: string;
  from: "customer" | "ai";
  text: string;
  timestamp: string;
};

// Hand-crafted Q&A - Phase 1 mock answers
const SUGGESTED_QUESTIONS = [
  "Why does this cost so much?",
  "What happens if I skip the cabin filter?",
  "Is the rotor turn really necessary?",
  "Can I bring my own parts?",
];

const SCRIPTED_ANSWERS: Record<string, string> = {
  "why does this cost so much":
    "The brake job is the biggest line ($690). Here's how that breaks down: front pads + rotor resurface labor is 4 hours at $148/hr ($592), plus Wagner OEX HD ceramic pads ($98). We use HD ceramic instead of standard pads because this ambulance carries heavy patient-loading equipment - standard pads wear through in ~12k miles on duty vehicles. The labor includes pulling both wheels, machining the rotors on our in-house lathe, and re-greasing the slider pins. If we used standard pads and skipped the rotor turn, you'd save ~$280 today, but you'd be back in 4 months for the same job again.",
  "what happens if i skip the cabin filter":
    "Short-term: nothing dramatic. Long-term: the filter is heavily soiled (we have a photo). When it's that loaded, three things happen - your A/C compressor works harder (3-5% efficiency hit), cabin air carries more brake dust into the cab (driver/patient comfort), and the HVAC blower motor's bearings wear faster from the resistance. The $72 today vs ~$400 for a blower motor in 8-12 months is the trade. Your call.",
  "is the rotor turn really necessary":
    "Honest answer: with new pads, technically you can skip it. We strongly recommend it for two reasons. (1) Your front rotors have a measurable groove pattern from the worn pads - new pads will conform to the groove, then wear unevenly and reduce stopping distance for the first 1-2k miles. (2) On an ambulance, that 1-2k mile window matters - every emergency run needs full braking confidence. The turn adds 1 hour of labor; we'd recommend it 9 times out of 10.",
  "can i bring my own parts":
    "On 100%-customer-supplied parts, our standard policy is no warranty on the labor (because we can't vouch for the part). For brake pads on a duty vehicle, that's a hard tradeoff - if the pads fail in 2 months from a manufacturing defect, you're paying us labor again to redo the job. We don't price-match the parts, but we do match or beat on the *total* job for fleet customers. If price is the issue, talk to Cameron - he has authority to adjust on this.",
};

function getAnswer(question: string): string {
  const normalized = question.toLowerCase().trim().replace(/[?.,!]/g, "");
  for (const key of Object.keys(SCRIPTED_ANSWERS)) {
    if (normalized.includes(key)) {
      return SCRIPTED_ANSWERS[key];
    }
  }
  // Fallback - looks like a thoughtful answer regardless of question
  return "Great question - this would normally be answered live by reading the estimate, inspection notes, and Andy's pricing policies. In the demo, I have 4 scripted answers covering the most-asked customer questions. Try clicking one of the suggested questions below to see how the AI explains line items in plain English.";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  customerName?: string;
};

export function CustomerEstimateExplainerModal({
  open,
  onOpenChange,
  estimateId = "EST-4847",
  customerName = "Med Trust",
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: "greet",
          from: "ai",
          text: `Hi Dana - I'm Andy's AI assistant. I can answer questions about your estimate for ${estimateId}. Try one of the suggestions below, or ask anything.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput("");
    }
  }, [open, estimateId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const customerMsg: Message = {
      id: `c-${Date.now()}`,
      from: "customer",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 900));
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      from: "ai",
      text: getAnswer(text),
      timestamp: new Date().toISOString(),
    };
    setTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Customer Estimate View"
      description={`How ${customerName} sees ${estimateId} - with the AI assistant`}
      size="lg"
    >
      {/* "Preview" banner so service advisor knows this is the customer's perspective */}
      <div className="mb-3 rounded-md border border-accent/40 bg-accent/15 px-3 py-2 text-[11px] text-[#991B1B]">
        <strong>Preview mode</strong> · This is what your customer sees when they open
        the share link. The AI answers in your shop's voice using inspection notes,
        pricing policies, and similar past jobs.
      </div>

      {/* Conversation */}
      <div className="rounded-lg border border-border bg-surface/30">
        <div className="flex h-[400px] flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={clsx(
                  "flex gap-2",
                  m.from === "customer" ? "justify-end" : "justify-start",
                )}
              >
                {m.from === "ai" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={clsx(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                    m.from === "customer"
                      ? "rounded-br-sm bg-foreground text-background"
                      : "rounded-bl-sm border border-border bg-background",
                  )}
                >
                  {m.from === "ai" && (
                    <div className="mb-1">
                      <AIBubble>Andy's AI</AIBubble>
                    </div>
                  )}
                  <p>{m.text}</p>
                </div>
                {m.from === "customer" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface">
                    <User className="h-3.5 w-3.5 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
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

          {/* Suggested questions chip row */}
          {messages.length <= 2 && (
            <div className="border-t border-border bg-background px-4 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-brand-green hover:bg-brand-green-tint hover:text-brand-green-soft"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-border bg-background p-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
                placeholder="Ask anything about this estimate…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-brand-green px-2.5 py-1 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
