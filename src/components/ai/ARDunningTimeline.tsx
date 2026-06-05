import { useState } from "react";
import {
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Check,
  Clock,
  AlertTriangle,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { AIBubble, SourcePill } from "@/components/ai/AIPrimitives";

type StepStatus = "done" | "pending" | "scheduled" | "skipped";

type DunningStep = {
  day: number;
  channel: "sms" | "email" | "voice" | "lien";
  title: string;
  body: string;
  status: StepStatus;
  scheduledFor?: string;
  sentAt?: string;
  response?: string;
};

const ICONS = {
  sms: MessageSquare,
  email: Mail,
  voice: Phone,
  lien: FileText,
};

/**
 * Customer-specific dunning timeline.
 * For demo: hardcoded for Northpoint Logistics (185 days past due, $17k).
 */
export function ARDunningTimeline({
  customerName = "Northpoint Logistics",
  amount = 17000,
  daysPastDue = 185,
}: {
  customerName?: string;
  amount?: number;
  daysPastDue?: number;
}) {
  const [paused, setPaused] = useState(false);

  const steps: DunningStep[] = [
    {
      day: 31,
      channel: "sms",
      title: "Day 31 - Friendly SMS reminder",
      body: `Hi Vince, this is Andy's Automotive. Your invoice for $${amount.toLocaleString()} (Dec service) is now 1 day past due. Reply PAY to receive a payment link, or call us at (904) 555-0100.`,
      status: "done",
      sentAt: "Dec 16, 2025 · 10:14 AM",
      response: "Read · no reply",
    },
    {
      day: 45,
      channel: "email",
      title: "Day 45 - Direct email with payment link",
      body: "Subject: Invoice past due - Northpoint Logistics - Body explained the balance breakdown, payment options, and offered a 12-month payment plan if cash flow is the issue.",
      status: "done",
      sentAt: "Dec 30, 2025 · 9:00 AM",
      response: "Opened · no reply",
    },
    {
      day: 60,
      channel: "voice",
      title: "Day 60 - AI voice call to Vince",
      body: "AI agent introduced itself, referenced the specific invoice, and offered the payment plan option. Vince said his crew was let go and the truck isn't generating revenue.",
      status: "done",
      sentAt: "Jan 14, 2026 · 2:38 PM",
      response: "Connected · 'Will pay when truck running'",
    },
    {
      day: 75,
      channel: "email",
      title: "Day 75 - Formal demand letter",
      body: "Subject: FINAL NOTICE - Pending collection action. Drafted but held for Andy's signature given the customer relationship context.",
      status: "done",
      sentAt: "Jan 29, 2026 · 9:00 AM",
      response: "Andy approved · sent",
    },
    {
      day: 90,
      channel: "voice",
      title: "Day 90 - Second AI voice call (firmer tone)",
      body: "AI agent referenced the prior conversation, noted no payment received, and warned of mechanic's lien filing within 30 days.",
      status: "done",
      sentAt: "Feb 13, 2026 · 11:21 AM",
      response: "Voicemail · Vince called back next day · paid $500",
    },
    {
      day: 120,
      channel: "sms",
      title: "Day 120 - Payment plan reminder",
      body: "Plan offered: $1,500/month for 12 months. AI generated a one-tap acceptance link.",
      status: "done",
      sentAt: "Mar 15, 2026 · 10:00 AM",
      response: "Read · no reply",
    },
    {
      day: 185,
      channel: "lien",
      title: "Day 185 - Mechanic's lien filing draft ready",
      body: "AI has prepared the FL mechanic's lien filing. Document includes invoice, signed estimate, service records. Filing fee $42. Requires Andy's signature.",
      status: "pending",
      scheduledFor: "Today - awaiting Andy's review",
    },
  ];

  const done = steps.filter((s) => s.status === "done").length;

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <AIBubble>Dunning Agent</AIBubble>
            <span className="text-xs font-semibold">{customerName}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>${amount.toLocaleString()} owed</span>
            <span>·</span>
            <span className="font-semibold text-destructive">{daysPastDue} days past due</span>
            <span>·</span>
            <span>{done} of {steps.length} actions complete</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold",
              paused
                ? "bg-foreground text-background hover:opacity-90"
                : "border border-border bg-background hover:bg-surface",
            )}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <ol className="relative space-y-0 border-l border-border ml-6 my-3 pl-0">
        {steps.map((s) => {
          const Icon = ICONS[s.channel];
          const done = s.status === "done";
          const pending = s.status === "pending";
          return (
            <li key={s.day} className="relative py-2.5 pl-6">
              <span
                className={clsx(
                  "absolute -left-[14px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                  done && "bg-brand-green text-brand-green-foreground",
                  pending && "bg-accent text-accent-foreground animate-pulse",
                  s.status === "skipped" && "bg-surface text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : pending ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </span>
              <div className="ml-3 rounded-md border border-border bg-background p-2.5 transition-colors hover:bg-surface/40">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={clsx(
                        "h-3 w-3",
                        done && "text-brand-green-soft",
                        pending && "text-[#991B1B]",
                      )}
                    />
                    <span className="text-xs font-semibold">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {s.sentAt ?? s.scheduledFor}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {s.response && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                    <Sparkles className="h-2.5 w-2.5 text-brand-green-soft" />
                    <span className="text-brand-green-soft font-semibold">
                      {s.response}
                    </span>
                  </div>
                )}
                {pending && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <button className="inline-flex items-center gap-1 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background hover:opacity-90">
                      Approve & sign
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold hover:bg-surface">
                      Negotiate plan
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <SourcePill source="ai-inferred" />
          <SourcePill source="shop-history" />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Next action in 0 days
        </div>
      </div>
    </div>
  );
}
