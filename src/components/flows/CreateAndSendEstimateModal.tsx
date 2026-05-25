import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Send,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  ArrowRight,
  Wrench,
  Package,
  User,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { selectRO } from "@/lib/shop-store";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { usd } from "@/lib/format";

// ============================================================================
// Workflow: Auto-create estimate → Share internally → Send to customer
// ============================================================================

type Phase = "generating" | "internal" | "customer" | "sending" | "done";
type Channel = "email" | "sms";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roId: string;
};

const ADVISORS = ["Cameron Mills", "Stewart Park", "Cody Bell"];

// Mocked line items the auto-generator "pulls" from the RO
const GENERATED_LINES = [
  {
    id: "L1",
    description: "Front brake service — pads & rotor turn",
    hours: 2.5,
    labor: 370,
    parts: 312,
  },
  {
    id: "L2",
    description: "Diesel oil & filter service",
    hours: 1.5,
    labor: 222,
    parts: 290,
  },
  {
    id: "L3",
    description: "Cabin AC diagnostic — rear unit",
    hours: 1.0,
    labor: 148,
    parts: 0,
  },
];

const GENERATING_STEPS = [
  "Reading jobs, parts, and labor from RO",
  "Pulling labor times from Mitchell1",
  "Pricing parts via Worldpac + NAPA catalogs",
  "Applying parts matrix & shop tax rate",
  "Drafting estimate",
];

export function CreateAndSendEstimateModal({ open, onOpenChange, roId }: Props) {
  const [phase, setPhase] = useState<Phase>("generating");
  const [genStep, setGenStep] = useState(0);
  const [advisor, setAdvisor] = useState(ADVISORS[0]);
  const [internalNote, setInternalNote] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [customerMsg, setCustomerMsg] = useState("");

  const ro = selectRO(roId);
  const customer = ro ? customers.find((c) => c.id === ro.customerId) : undefined;
  const vehicle = ro ? vehicles.find((v) => v.id === ro.vehicleId) : undefined;

  const subtotal = GENERATED_LINES.reduce((a, l) => a + l.labor + l.parts, 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  const estimateId = useMemo(() => `EST-${roId}-${Date.now().toString().slice(-4)}`, [roId]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase("generating");
      setGenStep(0);
      setAdvisor(ADVISORS[0]);
      setInternalNote("");
      setChannel("email");
      setCustomerMsg("");
    }
  }, [open]);

  // Default customer message once we know the customer
  useEffect(() => {
    if (customer && !customerMsg) {
      setCustomerMsg(
        `Hi ${customer.contactName.split(" ")[0]} — your estimate for ${vehicle?.unit ?? "your vehicle"} is ready (${usd.format(total)} total). Review and approve at the link below. — Andy's Automotive`,
      );
    }
  }, [customer, vehicle, total, customerMsg]);

  // Generate-phase animation
  useEffect(() => {
    if (!open || phase !== "generating") return;
    if (genStep < GENERATING_STEPS.length) {
      const t = setTimeout(() => setGenStep((s) => s + 1), genStep === 0 ? 250 : 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("internal"), 400);
    return () => clearTimeout(t);
  }, [open, phase, genStep]);

  if (!ro) return null;

  const handleSend = async () => {
    setPhase("sending");
    await new Promise((r) => setTimeout(r, 800));
    setPhase("done");
    setTimeout(() => {
      onOpenChange(false);
      toast.success(`Estimate ${estimateId} sent`, {
        description: `Shared with ${advisor.split(" ")[0]} · ${channel === "email" ? "Emailed" : "Texted"} ${customer?.contactName ?? "customer"}`,
      });
    }, 1200);
  };

  const stepIndex =
    phase === "generating" ? 0 : phase === "internal" ? 1 : phase === "customer" ? 2 : 3;

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (phase === "sending" || phase === "done") return;
        onOpenChange(o);
      }}
      title="Create & Send Estimate"
      description={
        phase === "generating"
          ? "Step 1 of 3 — Auto-generating from repair order"
          : phase === "internal"
            ? "Step 2 of 3 — Share with service advisor"
            : phase === "customer"
              ? "Step 3 of 3 — Send to customer"
              : phase === "sending"
                ? "Sending…"
                : "Done"
      }
      size="lg"
      footer={
        phase === "internal" ? (
          <>
            <div className="mr-auto text-[11px] text-muted-foreground">
              <span className="font-mono">{estimateId}</span> · {usd.format(total)} total
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setPhase("customer")}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
            >
              Share & Continue
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        ) : phase === "customer" ? (
          <>
            <button
              type="button"
              onClick={() => setPhase("internal")}
              className="mr-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Send className="h-3 w-3" />
              Send to {customer?.contactName.split(" ")[0] ?? "Customer"}
            </button>
          </>
        ) : null
      }
    >
      {/* Progress strip */}
      <div className="mb-5 flex items-center gap-2">
        {(["Generate", "Internal", "Customer"] as const).map((label, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  done && "bg-brand-green text-brand-green-foreground",
                  current && "bg-foreground text-background",
                  !done && !current && "bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </div>
              <div
                className={clsx(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </div>
              {i < 2 && (
                <div
                  className={clsx(
                    "h-px flex-1 transition-colors",
                    done ? "bg-brand-green/50" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {phase === "generating" && <GeneratingPanel step={genStep} />}

      {phase === "internal" && (
        <InternalSharePanel
          estimateId={estimateId}
          subtotal={subtotal}
          tax={tax}
          total={total}
          customer={customer?.name ?? ""}
          vehicle={vehicle?.unit ?? ""}
          advisor={advisor}
          setAdvisor={setAdvisor}
          internalNote={internalNote}
          setInternalNote={setInternalNote}
        />
      )}

      {phase === "customer" && (
        <CustomerSendPanel
          customer={customer}
          channel={channel}
          setChannel={setChannel}
          customerMsg={customerMsg}
          setCustomerMsg={setCustomerMsg}
          estimateId={estimateId}
          total={total}
        />
      )}

      {phase === "sending" && (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/30" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Sharing with {advisor.split(" ")[0]} and {channel === "email" ? "emailing" : "texting"} customer…
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex h-56 flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">Estimate sent</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              <span className="font-mono">{estimateId}</span> · {usd.format(total)}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 text-[11px]">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-tint px-2.5 py-1 font-semibold text-brand-green-soft">
              <Users className="h-3 w-3" />
              Shared with {advisor}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-tint px-2.5 py-1 font-semibold text-brand-green-soft">
              {channel === "email" ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
              Sent to {customer?.contactName ?? "customer"}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ============================================================================
// Phase 1 — Generating
// ============================================================================
function GeneratingPanel({ step }: { step: number }) {
  return (
    <div className="min-h-[280px] py-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-tint">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/20" />
            <Sparkles className="h-6 w-6 text-brand-green-soft" />
          </div>
        </div>
        <ul className="space-y-2">
          {GENERATING_STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li
                key={label}
                className={clsx(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-[12px] transition-all",
                  done && "border-brand-green/30 bg-brand-green-tint",
                  current && "border-brand-green bg-brand-green-tint animate-pulse",
                  !done && !current && "border-border bg-background opacity-50",
                )}
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    done && "bg-brand-green text-brand-green-foreground",
                    current && "bg-foreground text-background",
                    !done && !current && "bg-surface text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : current ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-background" />
                  ) : null}
                </span>
                <span
                  className={clsx(
                    "font-medium",
                    done && "text-brand-green-soft",
                    current && "text-foreground",
                    !done && !current && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Phase 2 — Internal share
// ============================================================================
function InternalSharePanel({
  estimateId,
  subtotal,
  tax,
  total,
  customer,
  vehicle,
  advisor,
  setAdvisor,
  internalNote,
  setInternalNote,
}: {
  estimateId: string;
  subtotal: number;
  tax: number;
  total: number;
  customer: string;
  vehicle: string;
  advisor: string;
  setAdvisor: (a: string) => void;
  internalNote: string;
  setInternalNote: (n: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Estimate preview card */}
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border bg-surface/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                Estimate Draft
              </div>
              <div className="text-[10px] text-muted-foreground">
                <span className="font-mono">{estimateId}</span> · {customer} · {vehicle}
              </div>
            </div>
          </div>
          <span className="rounded-full bg-brand-green-tint px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-green-soft">
            Auto-Generated
          </span>
        </div>
        <ul className="divide-y divide-border">
          {GENERATED_LINES.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{l.description}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                    {l.hours} hr · L {usd.format(l.labor)} · P {usd.format(l.parts)}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-xs font-semibold tabular-nums">
                {usd.format(l.labor + l.parts)}
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border bg-surface/30 px-4 py-2.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{usd.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (7%)</span>
            <span className="tabular-nums">{usd.format(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{usd.format(total)}</span>
          </div>
        </div>
      </div>

      {/* Share-with-advisor */}
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Share internally with advisor
          </h4>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          They'll get a review request before this goes to the customer.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Advisor
            </label>
            <select
              value={advisor}
              onChange={(e) => setAdvisor(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              {ADVISORS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Note (optional)
            </label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Anything they should check before it goes out?"
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Phase 3 — Send to customer
// ============================================================================
function CustomerSendPanel({
  customer,
  channel,
  setChannel,
  customerMsg,
  setCustomerMsg,
  estimateId,
  total,
}: {
  customer: { name: string; contactName: string; phone: string; email: string } | undefined;
  channel: Channel;
  setChannel: (c: Channel) => void;
  customerMsg: string;
  setCustomerMsg: (m: string) => void;
  estimateId: string;
  total: number;
}) {
  return (
    <div className="space-y-4">
      {/* Customer card */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 p-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            {customer?.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{customer?.name}</div>
            <div className="truncate text-[10px] text-muted-foreground">
              {customer?.contactName} · {channel === "email" ? customer?.email : customer?.phone}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Estimate
          </div>
          <div className="text-sm font-semibold tabular-nums">{usd.format(total)}</div>
        </div>
      </div>

      {/* Channel picker */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Delivery method
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ChannelButton
            active={channel === "email"}
            onClick={() => setChannel("email")}
            icon={Mail}
            label="Email"
            sub={customer?.email ?? ""}
          />
          <ChannelButton
            active={channel === "sms"}
            onClick={() => setChannel("sms")}
            icon={MessageSquare}
            label="Text (SMS)"
            sub={customer?.phone ?? ""}
          />
        </div>
      </div>

      {/* Message preview */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Message
          </label>
          <span className="text-[10px] text-muted-foreground">
            Includes one-tap approval link
          </span>
        </div>
        <textarea
          value={customerMsg}
          onChange={(e) => setCustomerMsg(e.target.value)}
          rows={4}
          className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          andysauto.com/e/{estimateId.toLowerCase()}
        </div>
      </div>
    </div>
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-brand-green bg-brand-green-tint"
          : "border-border bg-background hover:bg-surface",
      )}
    >
      <div
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          active ? "bg-brand-green text-brand-green-foreground" : "bg-surface text-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className={clsx("text-xs font-semibold", active && "text-brand-green-soft")}>
          {label}
        </div>
        <div className="truncate text-[10px] text-muted-foreground">{sub}</div>
      </div>
      {active && <Check className="ml-auto h-4 w-4 shrink-0 text-brand-green-soft" />}
    </button>
  );
}

// Silence unused-import warnings for icons reserved for future variants
const _unused = [Phone, Clock, Package, User];
void _unused;
