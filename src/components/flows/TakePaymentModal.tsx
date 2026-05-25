import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Banknote, FileText, Building2, Check } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { applyPayment, selectRO, selectBalance, type Payment } from "@/lib/shop-store";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { usdCents } from "@/lib/format";

type Method = Payment["method"];

const methods: Array<{ id: Method; label: string; description: string; icon: typeof CreditCard }> = [
  { id: "Card", label: "Credit / Debit", description: "Visa, MC, Amex, Discover · 2.7% fee", icon: CreditCard },
  { id: "ACH", label: "ACH / Bank", description: "Net-30 fleet accounts", icon: Building2 },
  { id: "Cash", label: "Cash", description: "In-shop only", icon: Banknote },
  { id: "Check", label: "Check", description: "Manual entry · no auto-deposit", icon: FileText },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roId: string;
};

export function TakePaymentModal({ open, onOpenChange, roId }: Props) {
  const ro = selectRO(roId);
  const customer = ro ? customers.find((c) => c.id === ro.customerId) : undefined;
  const vehicle = ro ? vehicles.find((v) => v.id === ro.vehicleId) : undefined;

  // Use RO total as the "total due" — in real life would account for paid amounts
  const totalDue = ro?.total ?? selectBalance(roId);
  const balance = selectBalance(roId);
  const initialAmount = balance > 0 ? balance : totalDue;

  const [amount, setAmount] = useState<string>(initialAmount.toFixed(2));
  const [method, setMethod] = useState<Method>("Card");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;

  const handleSubmit = async () => {
    if (!ro) return;
    if (parsedAmount <= 0) {
      toast.error("Enter an amount greater than $0");
      return;
    }
    setSubmitting(true);
    // Simulate a brief processing delay so the UX feels real
    await new Promise((r) => setTimeout(r, 600));
    applyPayment({
      roId,
      amount: parsedAmount,
      method,
      reference: reference.trim() || undefined,
    });
    setSubmitting(false);
    toast.success(`Payment recorded`, {
      description: `${usdCents.format(parsedAmount)} via ${method}${reference ? ` · ${reference}` : ""}`,
    });
    setAmount("");
    setReference("");
    onOpenChange(false);
  };

  if (!ro) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Take Payment" size="sm">
        <p className="text-sm text-muted-foreground">Repair order not found.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Take Payment"
      description={`RO #${ro.id} — ${customer?.name ?? ""}`}
      size="md"
      footer={
        <>
          <div className="mr-auto text-[11px] text-muted-foreground">
            Balance after this payment:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {usdCents.format(Math.max(0, balance - parsedAmount))}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || parsedAmount <= 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-brand-green-foreground/40 border-t-transparent" />
                Processing…
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Record Payment
              </>
            )}
          </button>
        </>
      }
    >
      {/* RO summary */}
      <div className="mb-4 rounded-md border border-border bg-surface/40 p-3">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Customer
            </div>
            <div className="mt-0.5 truncate font-semibold">{customer?.name}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vehicle
            </div>
            <div className="mt-0.5 truncate font-semibold">{vehicle?.unit}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Balance Due
            </div>
            <div className="mt-0.5 font-bold tabular-nums text-destructive">
              {usdCents.format(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            className="w-full rounded-md border border-border bg-background py-3 pl-8 pr-3 text-2xl font-semibold tabular-nums outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={() => setAmount(balance.toFixed(2))}
            className="rounded-full bg-surface px-2 py-0.5 font-semibold hover:bg-foreground hover:text-background"
          >
            Pay full balance
          </button>
          <button
            type="button"
            onClick={() => setAmount((balance / 2).toFixed(2))}
            className="rounded-full bg-surface px-2 py-0.5 font-semibold hover:bg-foreground hover:text-background"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => setAmount("100.00")}
            className="rounded-full bg-surface px-2 py-0.5 font-semibold hover:bg-foreground hover:text-background"
          >
            $100
          </button>
        </div>
      </div>

      {/* Method */}
      <div className="mt-5 space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {methods.map((m) => {
            const Icon = m.icon;
            const selected = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={clsx(
                  "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-brand-green bg-brand-green-tint"
                    : "border-border bg-background hover:bg-surface",
                )}
              >
                <Icon
                  className={clsx(
                    "mt-0.5 h-4 w-4 shrink-0",
                    selected ? "text-brand-green-soft" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {m.description}
                  </div>
                </div>
                {selected && (
                  <Check className="ml-auto h-3 w-3 shrink-0 text-brand-green-soft" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reference */}
      <div className="mt-5 space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Reference (optional)
        </label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder={
            method === "Check"
              ? "Check #1234"
              : method === "ACH"
                ? "Bank transfer ID"
                : method === "Card"
                  ? "Last 4 / authorization #"
                  : "Receipt note"
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>
    </Modal>
  );
}
