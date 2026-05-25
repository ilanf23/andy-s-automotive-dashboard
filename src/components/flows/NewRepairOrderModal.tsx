import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Search, User, Truck, ChevronLeft, Check } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { createRepairOrder } from "@/lib/shop-store";

type Step = "customer" | "vehicle" | "details";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  vehicleId?: string;
};

const ADVISORS = ["Cameron Mills", "Stewart Park", "Cody Bell"];

export function NewRepairOrderModal({
  open,
  onOpenChange,
  customerId: initialCustomerId,
  vehicleId: initialVehicleId,
}: Props) {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(
    initialVehicleId ? "details" : initialCustomerId ? "vehicle" : "customer",
  );
  const [customerId, setCustomerId] = useState<string>(initialCustomerId ?? "");
  const [vehicleId, setVehicleId] = useState<string>(initialVehicleId ?? "");
  const [description, setDescription] = useState("");
  const [techId, setTechId] = useState<string>("");
  const [advisor, setAdvisor] = useState<string>(ADVISORS[0]);
  const [customerSearch, setCustomerSearch] = useState("");

  // Pre-populate if we came in with a vehicleId
  if (initialVehicleId && !customerId) {
    const v = vehicles.find((x) => x.id === initialVehicleId);
    if (v) setCustomerId(v.customerId);
  }

  const customer = customers.find((c) => c.id === customerId);
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const customerOptions = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [customerSearch]);

  const customerVehicles = useMemo(
    () => vehicles.filter((v) => v.customerId === customerId),
    [customerId],
  );

  const reset = () => {
    setStep("customer");
    setCustomerId("");
    setVehicleId("");
    setDescription("");
    setTechId("");
    setCustomerSearch("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  const handleSubmit = () => {
    if (!customerId || !vehicleId || !description.trim()) {
      toast.error("Please fill in customer, vehicle, and concern");
      return;
    }
    const ro = createRepairOrder({
      customerId,
      vehicleId,
      description: description.trim(),
      technicianId: techId || undefined,
    });
    toast.success(`RO #${ro.id} created`, {
      description: `${customer?.name} · ${vehicle?.unit} — assigned to ${advisor.split(" ")[0]}`,
      action: {
        label: "Open",
        onClick: () => navigate({ to: "/repair-orders/$id", params: { id: ro.id } }),
      },
    });
    reset();
    onOpenChange(false);
    navigate({ to: "/repair-orders/$id", params: { id: ro.id } });
  };

  const canAdvance =
    (step === "customer" && customerId) ||
    (step === "vehicle" && vehicleId) ||
    (step === "details" && description.trim());

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="New Repair Order"
      description={
        step === "customer"
          ? "Step 1 of 3 — Select customer"
          : step === "vehicle"
            ? "Step 2 of 3 — Select vehicle"
            : "Step 3 of 3 — Concern & assignment"
      }
      size="md"
      footer={
        <>
          {step !== "customer" && (
            <button
              type="button"
              onClick={() =>
                setStep(step === "details" ? "vehicle" : "customer")
              }
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          {step === "details" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              Create Repair Order
            </button>
          ) : (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep(step === "customer" ? "vehicle" : "details")}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </>
      }
    >
      {/* Progress dots */}
      <div className="mb-4 flex items-center gap-1.5">
        {(["customer", "vehicle", "details"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className={clsx(
                "h-1.5 w-8 rounded-full transition-colors",
                step === s
                  ? "bg-brand-green"
                  : i < (["customer", "vehicle", "details"] as Step[]).indexOf(step)
                    ? "bg-brand-green/40"
                    : "bg-surface",
              )}
            />
          </div>
        ))}
      </div>

      {step === "customer" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              autoFocus
              placeholder="Search by name, contact, phone…"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {customerOptions.map((c) => {
              const selected = c.id === customerId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId(c.id);
                      setVehicleId("");
                    }}
                    className={clsx(
                      "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                      selected
                        ? "border-brand-green bg-brand-green-tint"
                        : "border-border hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {c.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold">{c.name}</span>
                          {c.type === "Fleet" && (
                            <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                              F
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {c.phone}
                        </div>
                      </div>
                    </div>
                    {selected && <Check className="h-4 w-4 shrink-0 text-brand-green" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => toast.info("Add customer — coming soon")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-surface"
          >
            <User className="h-3 w-3" />
            + Add new customer
          </button>
        </div>
      )}

      {step === "vehicle" && (
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-surface/40 p-2.5 text-xs">
            <span className="text-muted-foreground">Customer:</span>{" "}
            <span className="font-semibold">{customer?.name}</span>
          </div>
          {customerVehicles.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
              No vehicles on file for this customer
            </div>
          ) : (
            <ul className="space-y-1">
              {customerVehicles.map((v) => {
                const selected = v.id === vehicleId;
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setVehicleId(v.id)}
                      className={clsx(
                        "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                        selected
                          ? "border-brand-green bg-brand-green-tint"
                          : "border-border hover:bg-surface",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold">{v.unit}</div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            {v.year} {v.make} {v.model} · {v.licensePlate}
                          </div>
                        </div>
                      </div>
                      {selected && <Check className="h-4 w-4 shrink-0 text-brand-green" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={() => toast.info("Add vehicle — coming soon")}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-surface"
          >
            <Truck className="h-3 w-3" />
            + Add new vehicle
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface/40 p-2.5 text-xs">
            <div>
              <span className="text-muted-foreground">Customer:</span>{" "}
              <span className="font-semibold">{customer?.name}</span>
            </div>
            <div className="mt-0.5">
              <span className="text-muted-foreground">Vehicle:</span>{" "}
              <span className="font-semibold">{vehicle?.unit}</span>{" "}
              <span className="text-muted-foreground">
                · {vehicle?.year} {vehicle?.make} {vehicle?.model}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Concern / Symptom
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
              rows={3}
              placeholder="Customer reports: …"
              className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Service Advisor
              </label>
              <select
                value={advisor}
                onChange={(e) => setAdvisor(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              >
                {ADVISORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assign Tech (optional)
              </label>
              <select
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Unassigned</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
