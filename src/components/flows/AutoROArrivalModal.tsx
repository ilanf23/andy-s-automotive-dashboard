import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, ScanLine, Check, Truck, User, Wrench, Upload, Keyboard } from "lucide-react";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { AIThinkingPanel, SourcePill } from "@/components/ai/AIPrimitives";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { technicians } from "@/data/technicians";
import { createRepairOrder } from "@/lib/shop-store";

type Phase = "scan" | "manual" | "thinking" | "match" | "creating";

const SCAN_STEPS = [
  "Reading VIN/plate via camera OCR",
  "Decoding VIN — 1FDXE4FS7KDC42718",
  "Matching customer in your CRM",
  "Pulling vehicle service history (12 prior visits)",
  "Identifying next-available specialist tech",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AutoROArrivalModal({ open, onOpenChange }: Props) {
  const [phase, setPhase] = useState<Phase>("scan");
  const [step, setStep] = useState(0);
  const [vin, setVin] = useState("");
  const [plate, setPlate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Demo always matches to Med Trust MT-47
  const matchedVehicle = vehicles.find((v) => v.id === "VEH-MT47");
  const matchedCustomer = customers.find((c) => c.id === "CUST-MED");
  const assignedTech = technicians.find((t) => t.id === "TECH-ANDRE");

  useEffect(() => {
    if (open) {
      setPhase("scan");
      setStep(0);
      setVin("");
      setPlate("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "thinking") return;
    if (step < SCAN_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 250 : 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("match"), 350);
    return () => clearTimeout(t);
  }, [open, phase, step]);

  const startScan = () => {
    setStep(0);
    setPhase("thinking");
  };

  const decodeManualVin = () => {
    if (vin.length < 17) {
      toast.error("VIN must be 17 characters");
      return;
    }
    setStep(0);
    setPhase("thinking");
    // After a short delay, the thinking-phase effect will advance to match.
    setTimeout(() => {
      // No-op — phase progression handled by useEffect above; kept for symmetry.
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate OCR — autofill the captured VIN from the demo target.
    setVin("1FDXE4FS7KDC42718");
    toast.info("Reading VIN from photo…");
    startScan();
    // Reset the input so the same file can be re-uploaded later.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmAndCreate = async () => {
    if (!matchedVehicle || !matchedCustomer) return;
    setPhase("creating");
    await new Promise((r) => setTimeout(r, 700));
    const ro = createRepairOrder({
      customerId: matchedCustomer.id,
      vehicleId: matchedVehicle.id,
      description: "Vehicle arrived — concern pending tech intake",
      technicianId: assignedTech?.id,
    });
    toast.success(`RO #${ro.id} created on arrival`, {
      description: `${matchedVehicle.unit} · assigned to ${assignedTech?.name?.split(" ")[0] ?? "tech"} · inspection prompt sent`,
    });
    onOpenChange(false);
    navigate({ to: "/repair-orders/$id", params: { id: ro.id } });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Auto-RO on Arrival"
      description={
        phase === "scan"
          ? "Scan VIN or license plate — RO is created automatically"
          : phase === "manual"
            ? "Enter VIN or license plate manually"
            : phase === "thinking"
              ? "Identifying vehicle…"
              : phase === "match"
                ? "Match found"
                : "Creating RO…"
      }
      size="md"
      footer={
        phase === "match" ? (
          <>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAndCreate}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Check className="h-3 w-3" />
              Confirm & create RO
            </button>
          </>
        ) : null
      }
    >
      {phase === "scan" && (
        <div className="py-6">
          <div className="mx-auto max-w-sm space-y-4">
            {/* Camera viewport stub — entire div is clickable */}
            <button
              type="button"
              onClick={startScan}
              className="relative flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface/40 transition-colors hover:bg-surface/70 focus:outline-none focus:ring-2 focus:ring-brand-green/40"
              aria-label="Start camera scan"
            >
              <div className="absolute inset-4 rounded-md border-2 border-brand-green/60">
                <div className="absolute -top-px left-0 h-3 w-12 border-t-2 border-l-2 border-brand-green" />
                <div className="absolute -top-px right-0 h-3 w-12 border-t-2 border-r-2 border-brand-green" />
                <div className="absolute -bottom-px left-0 h-3 w-12 border-b-2 border-l-2 border-brand-green" />
                <div className="absolute -bottom-px right-0 h-3 w-12 border-b-2 border-r-2 border-brand-green" />
              </div>
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Point camera at VIN plate or license plate
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  (tap anywhere to scan)
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={startScan}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-green px-3 py-2.5 text-sm font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <ScanLine className="h-4 w-4" />
              Scan now
            </button>

            {/* Hidden file input + upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-surface"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload photo of VIN
            </button>

            <div className="text-center text-[10px] text-muted-foreground">
              or{" "}
              <button
                type="button"
                onClick={() => setPhase("manual")}
                className="font-semibold text-foreground hover:underline"
              >
                type VIN/plate manually
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "manual" && (
        <div className="py-4">
          <div className="mx-auto max-w-sm space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-border bg-surface/40 p-2.5">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                Type the 17-character VIN, or the license plate.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                VIN
              </label>
              <input
                type="text"
                value={vin}
                onChange={(e) =>
                  setVin(e.target.value.toUpperCase().slice(0, 17))
                }
                maxLength={17}
                placeholder="1FDXE4FS7KDC42718"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-wider placeholder:text-muted-foreground/50 focus:border-foreground/40 focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>17 characters required</span>
                <span className="tabular-nums">{vin.length}/17</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                License Plate
              </label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="MED-MT47"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase placeholder:text-muted-foreground/50 focus:border-foreground/40 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={decodeManualVin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-green px-3 py-2.5 text-sm font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <ScanLine className="h-4 w-4" />
              Decode VIN
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setPhase("scan")}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                ← Use scanner instead
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "thinking" && (
        <AIThinkingPanel steps={SCAN_STEPS} currentStep={step} />
      )}

      {phase === "match" && matchedVehicle && matchedCustomer && (
        <div className="space-y-4">
          <div className="rounded-lg border border-brand-green/30 bg-brand-green-tint p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand-green-soft" />
              <p className="text-xs font-semibold text-brand-green-soft">
                Vehicle identified · 98% confidence
              </p>
            </div>
            {vin && (
              <p className="mt-1.5 font-mono text-[10px] text-brand-green-soft/80">
                Decoded from: {vin}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <SourcePill source="vin-decode" />
              <SourcePill source="shop-history" />
            </div>
          </div>

          {/* Match summary */}
          <div className="rounded-lg border border-border bg-background">
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Vehicle */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  Vehicle
                </div>
                <div className="mt-2">
                  <div className="text-sm font-semibold">{matchedVehicle.unit}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {matchedVehicle.year} {matchedVehicle.make} {matchedVehicle.model}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                    {matchedVehicle.vin}
                  </div>
                </div>
              </div>
              {/* Customer */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3 w-3" />
                  Customer
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{matchedCustomer.name}</span>
                    <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                      Fleet
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {matchedCustomer.contactName}
                  </div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground">
                    12 prior visits · LTV $1.05M
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Wrench className="h-3 w-3" />
                Suggested Tech Assignment
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {assignedTech?.initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{assignedTech?.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {assignedTech?.role}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Current load</div>
                  <div className="text-xs font-semibold tabular-nums">
                    {assignedTech?.utilization}% util
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Reasoning: ambulance specialist + currently available + has serviced
                this vehicle 3 times previously
              </p>
            </div>
          </div>

          {/* Auto-actions preview */}
          <div className="rounded-md border border-border bg-surface/40 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              On confirm, AI will:
            </div>
            <ul className="mt-1.5 space-y-1 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-brand-green-soft" />
                Create RO with vehicle + customer pre-linked
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-brand-green-soft" />
                Assign Andre Bell + send inspection prompt to his phone
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-brand-green-soft" />
                Notify Med Trust dispatch that vehicle arrived
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-brand-green-soft" />
                Pre-fill any open recommendations from last visit
              </li>
            </ul>
          </div>
        </div>
      )}

      {phase === "creating" && (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-green/30" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-green text-brand-green-foreground">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Creating RO + notifying tech…</p>
        </div>
      )}
    </Modal>
  );
}
