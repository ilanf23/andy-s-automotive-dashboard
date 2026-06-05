import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { NewRepairOrderModal } from "@/components/flows/NewRepairOrderModal";
import { NewInspectionModal } from "@/components/flows/NewInspectionModal";
import { TakePaymentModal } from "@/components/flows/TakePaymentModal";
import { AIEstimateBuilderModal } from "@/components/flows/AIEstimateBuilderModal";
import { CreateAndSendEstimateModal } from "@/components/flows/CreateAndSendEstimateModal";
import { FrankensteinLaborModal } from "@/components/flows/FrankensteinLaborModal";
import { CustomerEstimateExplainerModal } from "@/components/flows/CustomerEstimateExplainerModal";
import { AutoROArrivalModal } from "@/components/flows/AutoROArrivalModal";
import { PartsIdentifierModal } from "@/components/flows/PartsIdentifierModal";
import { PreROQualityCheckModal } from "@/components/flows/PreROQualityCheckModal";
import { DiagnosticAssistantModal } from "@/components/flows/DiagnosticAssistantModal";
import { FleetSubmitModal } from "@/components/flows/FleetSubmitModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ============================================================================
// Modal registry - each entry has a name + payload shape
// ============================================================================

type ModalRegistry = {
  "new-ro": {
    customerId?: string;
    vehicleId?: string;
  };
  "new-inspection": {
    repairOrderId?: string;
  };
  "take-payment": {
    roId: string;
    totalDue?: number;
    balance?: number;
  };
  "ai-estimate-builder": {
    roId: string;
  };
  "create-send-estimate": {
    roId: string;
  };
  "frankenstein-labor": {
    jobDescription?: string;
    vehicleLabel?: string;
  };
  "customer-estimate-explainer": {
    estimateId?: string;
    customerName?: string;
  };
  "auto-ro-arrival": Record<string, never>;
  "parts-identifier": Record<string, never>;
  "pre-ro-qc": {
    roId: string;
  };
  "diagnostic-assistant": {
    initialSymptom?: string;
  };
  "fleet-submit": {
    estimateId?: string;
    platform?: "Fleetio" | "Holman" | "Enterprise" | "Mike Albert's";
  };
  confirm: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "default" | "danger" | "success";
    onConfirm: () => void | Promise<void>;
  };
};

type ModalName = keyof ModalRegistry;

type OpenModal = {
  [K in ModalName]: { name: K; payload: ModalRegistry[K] };
}[ModalName];

type ModalContextValue = {
  open: <K extends ModalName>(name: K, payload: ModalRegistry[K]) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModals must be used within ModalProvider");
  }
  return ctx;
}

// ============================================================================
// Provider
// ============================================================================

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<OpenModal | null>(null);

  const open = useCallback<ModalContextValue["open"]>((name, payload) => {
    setActive({ name, payload } as OpenModal);
  }, []);

  const close = useCallback(() => setActive(null), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Render the active modal */}
      {active?.name === "new-ro" && (
        <NewRepairOrderModal
          open
          onOpenChange={(o) => !o && close()}
          customerId={active.payload.customerId}
          vehicleId={active.payload.vehicleId}
        />
      )}
      {active?.name === "new-inspection" && (
        <NewInspectionModal
          open
          onOpenChange={(o) => !o && close()}
          repairOrderId={active.payload.repairOrderId}
        />
      )}
      {active?.name === "take-payment" && (
        <TakePaymentModal
          open
          onOpenChange={(o) => !o && close()}
          roId={active.payload.roId}
          totalDue={active.payload.totalDue}
          balance={active.payload.balance}
        />
      )}
      {active?.name === "ai-estimate-builder" && (
        <AIEstimateBuilderModal
          open
          onOpenChange={(o) => !o && close()}
          roId={active.payload.roId}
        />
      )}
      {active?.name === "create-send-estimate" && (
        <CreateAndSendEstimateModal
          open
          onOpenChange={(o) => !o && close()}
          roId={active.payload.roId}
        />
      )}
      {active?.name === "frankenstein-labor" && (
        <FrankensteinLaborModal
          open
          onOpenChange={(o) => !o && close()}
          jobDescription={active.payload.jobDescription}
          vehicleLabel={active.payload.vehicleLabel}
        />
      )}
      {active?.name === "customer-estimate-explainer" && (
        <CustomerEstimateExplainerModal
          open
          onOpenChange={(o) => !o && close()}
          estimateId={active.payload.estimateId}
          customerName={active.payload.customerName}
        />
      )}
      {active?.name === "auto-ro-arrival" && (
        <AutoROArrivalModal open onOpenChange={(o) => !o && close()} />
      )}
      {active?.name === "parts-identifier" && (
        <PartsIdentifierModal open onOpenChange={(o) => !o && close()} />
      )}
      {active?.name === "pre-ro-qc" && (
        <PreROQualityCheckModal
          open
          onOpenChange={(o) => !o && close()}
          roId={active.payload.roId}
        />
      )}
      {active?.name === "diagnostic-assistant" && (
        <DiagnosticAssistantModal
          open
          onOpenChange={(o) => !o && close()}
          initialSymptom={active.payload.initialSymptom}
        />
      )}
      {active?.name === "fleet-submit" && (
        <FleetSubmitModal
          open
          onOpenChange={(o) => !o && close()}
          estimateId={active.payload.estimateId}
          platform={active.payload.platform}
        />
      )}
      {active?.name === "confirm" && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && close()}
          title={active.payload.title}
          description={active.payload.description}
          confirmLabel={active.payload.confirmLabel}
          cancelLabel={active.payload.cancelLabel}
          tone={active.payload.tone}
          onConfirm={async () => {
            await active.payload.onConfirm();
            close();
          }}
        />
      )}
    </ModalContext.Provider>
  );
}
