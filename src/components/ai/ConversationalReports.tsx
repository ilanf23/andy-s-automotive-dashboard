import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";
import { AIBubble, SourcePill } from "@/components/ai/AIPrimitives";

type Message = {
  id: string;
  from: "user" | "ai";
  text?: string;
  // Rich response card
  answer?: {
    headline: string;
    value: string;
    delta?: { direction: "up" | "down"; value: string };
    formula?: string;
    breakdown?: { label: string; value: string }[];
    sources?: ("shop-history" | "mitchell1" | "ai-inferred")[];
    note?: string;
  };
};

const SUGGESTED_QUESTIONS = [
  "What's my real labor GP this week using hourly pay?",
  "Which techs are below 50% efficiency?",
  "How much did Med Trust spend with us in Q1?",
  "What's my parts margin on diesel oil services?",
];

const SCRIPTED: Record<string, Message["answer"]> = {
  "what's my real labor gp this week using hourly pay": {
    headline: "Labor GP — this week (hourly pay basis)",
    value: "58.4%",
    delta: { direction: "up", value: "+1.2 pts vs last week" },
    formula:
      "(Labor sales $24,830 − tech wages paid $10,330) ÷ Labor sales $24,830 = 58.4%",
    breakdown: [
      { label: "Labor sales", value: "$24,830" },
      { label: "Tech wages paid (actual hourly)", value: "$10,330" },
      { label: "Gross profit", value: "$14,500" },
      { label: "GP %", value: "58.4%" },
    ],
    sources: ["shop-history", "ai-inferred"],
    note:
      "Tekmetric's reports tab shows 82.6% because it calculates as if you pay flat-rate. Your shop pays hourly, so the real number is 58.4%. I pulled actual timeclock hours and multiplied by each tech's hourly rate to get the true wages paid.",
  },
  "which techs are below 50% efficiency": {
    headline: "Techs below 50% efficiency this week",
    value: "1 tech",
    breakdown: [
      { label: "Trevor Hicks", value: "47% (28.2h billed of 60h paid)" },
      { label: "Marcus Reeves", value: "92% ✓" },
      { label: "Jose Alvarez", value: "86% ✓" },
      { label: "Andre Bell", value: "78% ✓" },
      { label: "Danny Pearce", value: "71% ✓" },
    ],
    sources: ["shop-history"],
    note:
      "Trevor has been spending most of his time on the Bayside Marine F-250 — that job has run 18h over estimate. Worth reviewing his RO assignment mix.",
  },
  "how much did med trust spend with us in q1": {
    headline: "Med Trust — Q1 2026 spend",
    value: "$284,700",
    delta: { direction: "up", value: "+14% vs Q1 2025" },
    breakdown: [
      { label: "January", value: "$87,200 (8 ROs)" },
      { label: "February", value: "$94,500 (9 ROs)" },
      { label: "March", value: "$103,000 (11 ROs)" },
      { label: "Q1 total", value: "$284,700 (28 ROs)" },
      { label: "Avg ARO", value: "$10,167" },
    ],
    sources: ["shop-history"],
    note:
      "Trending up — on pace for $1.14M this year vs $1.05M last year. Their fleet has been growing.",
  },
  "what's my parts margin on diesel oil services": {
    headline: "Diesel oil service — parts margin (last 30 days)",
    value: "61.2%",
    delta: { direction: "down", value: "−3.4 pts vs prior 30 days" },
    formula:
      "(Parts sales $4,820 − parts cost $1,870) ÷ Parts sales $4,820 = 61.2%",
    breakdown: [
      { label: "Parts sales", value: "$4,820" },
      { label: "Parts cost", value: "$1,870" },
      { label: "Margin %", value: "61.2%" },
      { label: "Below your target", value: "65% target" },
    ],
    sources: ["shop-history"],
    note:
      "Margin slipped because Worldpac raised the price on Fleetguard LF9001 by 14% on April 1. Your customer price hasn't updated. Want me to suggest a new price?",
  },
};

function answerFor(question: string): Message["answer"] | null {
  const normalized = question.toLowerCase().trim().replace(/[?.,!]/g, "");
  for (const key of Object.keys(SCRIPTED)) {
    if (normalized.includes(key.slice(0, 20))) {
      return SCRIPTED[key];
    }
  }
  return null;
}

export function ConversationalReports() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greet",
      from: "ai",
      text: "Ask me anything about your shop data. I'll show you the answer + the math behind it. Try one of the suggestions below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: "user", text },
    ]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 900));
    const answer = answerFor(text);
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      answer
        ? { id: `a-${Date.now()}`, from: "ai", answer }
        : {
            id: `a-${Date.now()}`,
            from: "ai",
            text: "Great question. In the demo, I have 4 scripted answers covering the most common reports questions. Try clicking one of the suggestions below to see how I show my work.",
          },
    ]);
  };

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <AIBubble>Ask Reports</AIBubble>
          <span className="text-[11px] text-muted-foreground">
            Natural-language Q&A · always shows the math
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div className="max-h-[500px] min-h-[280px] overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx("flex gap-2", m.from === "user" ? "justify-end" : "justify-start")}
            >
              {m.from === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={clsx(
                  "max-w-[80%]",
                  m.from === "user" ? "" : "min-w-0 flex-1",
                )}
              >
                {m.text && (
                  <div
                    className={clsx(
                      "rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                      m.from === "user"
                        ? "rounded-br-sm bg-foreground text-background"
                        : "rounded-bl-sm border border-border bg-background",
                    )}
                  >
                    {m.text}
                  </div>
                )}
                {m.answer && <AnswerCard answer={m.answer} />}
              </div>
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
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="border-t border-border bg-surface/30 px-4 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Try
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:border-brand-green hover:bg-brand-green-tint hover:text-brand-green-soft"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Ask anything — 'what's my GP this month', 'who's my top customer'…"
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
  );
}

function AnswerCard({ answer }: { answer: NonNullable<Message["answer"]> }) {
  return (
    <div className="rounded-2xl rounded-bl-sm border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {answer.headline}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{answer.value}</span>
            {answer.delta && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 text-[11px] font-semibold",
                  answer.delta.direction === "up"
                    ? "text-brand-green-soft"
                    : "text-destructive",
                )}
              >
                {answer.delta.direction === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {answer.delta.value}
              </span>
            )}
          </div>
        </div>
      </div>

      {answer.formula && (
        <div className="mt-3 rounded-md bg-surface/40 px-2.5 py-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Math
          </div>
          <p className="mt-0.5 font-mono text-[11px]">{answer.formula}</p>
        </div>
      )}

      {answer.breakdown && (
        <div className="mt-3 space-y-1">
          {answer.breakdown.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-between border-b border-border py-1 text-[11px] last:border-0"
            >
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-semibold tabular-nums">{b.value}</span>
            </div>
          ))}
        </div>
      )}

      {answer.sources && (
        <div className="mt-3 flex items-center gap-1.5">
          {answer.sources.map((s) => (
            <SourcePill key={s} source={s} />
          ))}
        </div>
      )}

      {answer.note && (
        <p className="mt-3 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-brand-green-soft">Heads up: </span>
          {answer.note}
        </p>
      )}
    </div>
  );
}
