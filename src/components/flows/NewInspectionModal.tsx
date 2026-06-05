import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Search, ChevronLeft, Check, Truck, ClipboardCheck } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { inspectionTemplates } from "@/data/inspectionTemplates";
import {
  createInspection,
  useShopState,
} from "@/lib/shop-store";

type Step = "ro" | "assign";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select an RO and jump straight to the assign step. */
  repairOrderId?: string;
};

export function NewInspectionModal({
  open,
  onOpenChange,
  repairOrderId: initialRoId,
}: Props) {
  const navigate = useNavigate();
  const { repairOrders } = useShopState();

  const [step, setStep] = useState<Step>(initialRoId ? "assign" : "ro");
  const [roId, setRoId] = useState<string>(initialRoId ?? "");
  const [techId, setTechId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("dvi-37");
  const [notes, setNotes] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const custMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), []);
  const vehMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), []);

  const ros = useMemo(() => {
    const q = search.trim().toLowerCase();
    return repairOrders
      .filter((r) => (showAll ? true : r.status !== "completed"))
      .filter((r) => {
        if (!q) return true;
        const c = custMap.get(r.customerId);
        const v = vehMap.get(r.vehicleId);
        return (
          r.id.toLowerCase().includes(q) ||
          (c?.name.toLowerCase().includes(q) ?? false) ||
          (v?.unit.toLowerCase().includes(q) ?? false) ||
          (v?.licensePlate?.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, 12);
  }, [repairOrders, search, showAll, custMap, vehMap]);

  const selectedRO = repairOrders.find((r) => r.id === roId);
  const selectedCustomer = selectedRO ? custMap.get(selectedRO.customerId) : undefined;
  const selectedVehicle = selectedRO ? vehMap.get(selectedRO.vehicleId) : undefined;

  const reset = () => {
    setStep("ro");
    setRoId("");
    setTechId("");
    setTemplateId("dvi-37");
    setNotes("");
    setSearch("");
    setShowAll(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = () => {
    if (!roId || !techId) {
      toast.error("Pick an RO and assign a tech");
      return;
    }
    const ins = createInspection({
      repairOrderId: roId,
      technicianId: techId,
      templateId,
      notes: notes.trim() || undefined,
    });
    const tech = technicians.find((t) => t.id === techId);
    toast.success(`Inspection ${ins.id} started`, {
      description: `${selectedCustomer?.name ?? "-"} · ${selectedVehicle?.unit ?? "-"} - ${tech?.name.split(" ")[0] ?? "tech"}`,
      action: {
        label: "Open",
        onClick: () =>
          navigate({ to: "/inspections/$id", params: { id: ins.id } }),
      },
    });
    reset();
    onOpenChange(false);
    navigate({ to: "/inspections/$id", params: { id: ins.id } });
  };

  const canAdvance =
    (step === "ro" && roId) || (step === "assign" && techId);

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Start Inspection"
      description={
        step === "ro"
          ? "Step 1 of 2 - Pick the repair order"
          : "Step 2 of 2 - Assign tech & template"
      }
      size="md"
      footer={
        <>
          {step === "assign" && !initialRoId && (
            <button
              type="button"
              onClick={() => setStep("ro")}
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
          {step === "ro" ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep("assign")}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90 disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              Start Inspection
            </button>
          )}
        </>
      }
    >
      <div className="mb-4 flex items-center gap-1.5">
        {(["ro", "assign"] as Step[]).map((s, i) => (
          <span
            key={s}
            className={clsx(
              "h-1.5 w-10 rounded-full transition-colors",
              step === s
                ? "bg-brand-green"
                : i < (["ro", "assign"] as Step[]).indexOf(step)
                  ? "bg-brand-green/40"
                  : "bg-surface",
            )}
          />
        ))}
      </div>

      {step === "ro" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              placeholder="Search by RO #, customer, vehicle, plate…"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {showAll ? "Showing all repair orders" : "Showing open repair orders"}
            </span>
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="font-medium text-foreground hover:underline"
            >
              {showAll ? "Open only" : "Show all"}
            </button>
          </div>

          {ros.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
              No matching repair orders. Try clearing search or showing all.
            </div>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {ros.map((r) => {
                const c = custMap.get(r.customerId);
                const v = vehMap.get(r.vehicleId);
                const selected = r.id === roId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setRoId(r.id)}
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold tabular-nums">
                              #{r.id}
                            </span>
                            <span className="truncate text-xs font-semibold">
                              {c?.name ?? "-"}
                            </span>
                            {c?.type === "Fleet" && (
                              <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                                F
                              </span>
                            )}
                          </div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            <span className="font-medium text-foreground/80">
                              {v?.unit ?? "-"}
                            </span>{" "}
                            · {v ? `${v.year} ${v.make} ${v.model}` : "-"}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0 text-brand-green" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {step === "assign" && selectedRO && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface/40 p-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">RO:</span>
              <span className="font-semibold tabular-nums">#{selectedRO.id}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold">{selectedCustomer?.name ?? "-"}</span>
            </div>
            <div className="mt-0.5 pl-5">
              <span className="text-muted-foreground">Vehicle:</span>{" "}
              <span className="font-semibold">{selectedVehicle?.unit ?? "-"}</span>{" "}
              <span className="text-muted-foreground">
                · {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : "-"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              {inspectionTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.items.length} items
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Assign Tech
            </label>
            <select
              value={techId}
              onChange={(e) => setTechId(e.target.value)}
              autoFocus
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Select a tech…</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Notes <span className="font-normal normal-case text-muted-foreground/70">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={selectedRO.description ?? "Anything the tech should focus on…"}
              className="mt-1 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
