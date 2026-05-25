import { useSyncExternalStore } from "react";
import { repairOrders as seedROs, type RepairOrder } from "@/data/repairOrders";
import { customers as seedCustomers } from "@/data/customers";
import { vehicles as seedVehicles } from "@/data/vehicles";
import {
  inspections as seedInspections,
  type Inspection,
  type InspectionItem,
} from "@/data/inspections";
import { getTemplate } from "@/data/inspectionTemplates";
import type { ShopStatus } from "@/components/shop/StatusBadge";

// ============================================================================
// State shape
// ============================================================================

export type Payment = {
  id: string;
  roId: string;
  amount: number;
  method: "Card" | "ACH" | "Cash" | "Check";
  at: string; // ISO
  reference?: string;
};

export type AIEstimateLine = {
  id: string;
  roId: string;
  description: string;
  partNumber?: string;
  partVendor?: string;
  partPrice: number;
  laborHours: number;
  laborRate: number;
  total: number;
};

export type AIBuilderRun = {
  roId: string;
  at: string;
  linesAdded: number;
  dollarsAdded: number;
  minutesSaved: number;
};

export type ShopState = {
  repairOrders: RepairOrder[];
  payments: Payment[];
  /** RO ids that were created in this session — used for "NEW" badges */
  newlyCreatedROs: Set<string>;
  /** AI-added estimate lines, indexed by RO id */
  aiLinesByRO: Map<string, AIEstimateLine[]>;
  /** ROs where the AI Builder resolved the Lost Revenue gap */
  lostRevenueResolvedROs: Set<string>;
  /** Audit log of AI Builder runs */
  aiBuilderRuns: AIBuilderRun[];
  inspections: Inspection[];
  /** Inspection ids that were created in this session */
  newlyCreatedInspections: Set<string>;
};

// ============================================================================
// In-memory store with subscribe pattern
// ============================================================================

let state: ShopState = {
  repairOrders: [...seedROs],
  payments: [],
  newlyCreatedROs: new Set(),
  aiLinesByRO: new Map(),
  lostRevenueResolvedROs: new Set(),
  aiBuilderRuns: [],
  inspections: [...seedInspections],
  newlyCreatedInspections: new Set(),
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getShopState(): ShopState {
  return state;
}

export function subscribeShopState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ============================================================================
// React hook
// ============================================================================

export function useShopState(): ShopState {
  return useSyncExternalStore(subscribeShopState, getShopState, getShopState);
}

// ============================================================================
// Actions
// ============================================================================

function setState(updater: (prev: ShopState) => ShopState) {
  state = updater(state);
  emit();
}

let roCounter = 4860; // continues from seed data
function nextRoId(): string {
  roCounter += 1;
  return String(roCounter);
}

export function createRepairOrder(input: {
  customerId: string;
  vehicleId: string;
  description: string;
  technicianId?: string;
}): RepairOrder {
  const newRO: RepairOrder = {
    id: nextRoId(),
    customerId: input.customerId,
    vehicleId: input.vehicleId,
    technicianId: input.technicianId,
    status: "just-arrived",
    total: 0,
    daysInShop: 0,
    openedAt: new Date().toISOString().slice(0, 10),
    description: input.description,
  };
  setState((prev) => ({
    ...prev,
    repairOrders: [newRO, ...prev.repairOrders],
    newlyCreatedROs: new Set([...prev.newlyCreatedROs, newRO.id]),
  }));
  return newRO;
}

let inspectionCounter = 4860; // continues from seed data
function nextInspectionId(): string {
  inspectionCounter += 1;
  return `INS-${inspectionCounter}`;
}

export function createInspection(input: {
  repairOrderId: string;
  technicianId: string;
  templateId?: string;
  notes?: string;
}): Inspection {
  const templateId = input.templateId ?? "dvi-37";
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown inspection template: ${templateId}`);
  }
  const id = nextInspectionId();
  const items: InspectionItem[] = template.items.map((t, i) => ({
    id: `${id}-${String(i + 1).padStart(2, "0")}`,
    category: t.category,
    name: t.name,
    status: "unset",
  }));
  const ins: Inspection = {
    id,
    repairOrderId: input.repairOrderId,
    technicianId: input.technicianId,
    items,
  };
  setState((prev) => ({
    ...prev,
    inspections: [ins, ...prev.inspections],
    newlyCreatedInspections: new Set([...prev.newlyCreatedInspections, id]),
  }));
  return ins;
}

export function setInspectionItemStatus(
  inspectionId: string,
  itemId: string,
  status: InspectionItem["status"],
) {
  setState((prev) => ({
    ...prev,
    inspections: prev.inspections.map((ins) =>
      ins.id === inspectionId
        ? {
            ...ins,
            items: ins.items.map((it) =>
              it.id === itemId ? { ...it, status } : it,
            ),
          }
        : ins,
    ),
  }));
}

export function completeInspection(inspectionId: string) {
  setState((prev) => ({
    ...prev,
    inspections: prev.inspections.map((ins) =>
      ins.id === inspectionId
        ? { ...ins, completedAt: new Date().toISOString() }
        : ins,
    ),
  }));
}

export function selectInspection(inspectionId: string): Inspection | undefined {
  return state.inspections.find((i) => i.id === inspectionId);
}

export function updateROStatus(roId: string, status: ShopStatus) {
  setState((prev) => ({
    ...prev,
    repairOrders: prev.repairOrders.map((r) =>
      r.id === roId ? { ...r, status } : r,
    ),
  }));
}

export function applyPayment(input: {
  roId: string;
  amount: number;
  method: Payment["method"];
  reference?: string;
}): Payment {
  const payment: Payment = {
    id: `PMT-${Date.now()}`,
    roId: input.roId,
    amount: input.amount,
    method: input.method,
    at: new Date().toISOString(),
    reference: input.reference,
  };
  setState((prev) => ({
    ...prev,
    payments: [payment, ...prev.payments],
  }));
  return payment;
}

/**
 * Apply AI-generated estimate lines to an RO.
 * Updates RO total, marks Lost Revenue as resolved, and logs the run for audit.
 */
export function applyAIEstimateLines(input: {
  roId: string;
  lines: Omit<AIEstimateLine, "id" | "roId">[];
  minutesSaved: number;
}) {
  const linesWithIds: AIEstimateLine[] = input.lines.map((l, i) => ({
    ...l,
    id: `AI-${Date.now()}-${i}`,
    roId: input.roId,
  }));
  const dollarsAdded = linesWithIds.reduce((acc, l) => acc + l.total, 0);
  setState((prev) => {
    const existing = prev.aiLinesByRO.get(input.roId) ?? [];
    const nextMap = new Map(prev.aiLinesByRO);
    nextMap.set(input.roId, [...existing, ...linesWithIds]);
    const resolved = new Set(prev.lostRevenueResolvedROs);
    resolved.add(input.roId);
    return {
      ...prev,
      aiLinesByRO: nextMap,
      lostRevenueResolvedROs: resolved,
      // Update RO total to include the new lines
      repairOrders: prev.repairOrders.map((r) =>
        r.id === input.roId ? { ...r, total: r.total + dollarsAdded } : r,
      ),
      aiBuilderRuns: [
        {
          roId: input.roId,
          at: new Date().toISOString(),
          linesAdded: linesWithIds.length,
          dollarsAdded,
          minutesSaved: input.minutesSaved,
        },
        ...prev.aiBuilderRuns,
      ],
    };
  });
  return { linesAdded: linesWithIds.length, dollarsAdded };
}

export function selectAILinesForRO(roId: string): AIEstimateLine[] {
  return state.aiLinesByRO.get(roId) ?? [];
}

export function isLostRevenueResolved(roId: string): boolean {
  return state.lostRevenueResolvedROs.has(roId);
}

export function postRepairOrder(roId: string) {
  setState((prev) => ({
    ...prev,
    repairOrders: prev.repairOrders.map((r) =>
      r.id === roId
        ? { ...r, status: "completed", closedAt: new Date().toISOString().slice(0, 10) }
        : r,
    ),
  }));
}

// ============================================================================
// Selectors (do not subscribe — call from inside components that already do)
// ============================================================================

export function selectRO(roId: string): RepairOrder | undefined {
  return state.repairOrders.find((r) => r.id === roId);
}

export function selectPaymentsForRO(roId: string): Payment[] {
  return state.payments.filter((p) => p.roId === roId);
}

export function selectBalance(roId: string): number {
  const ro = selectRO(roId);
  if (!ro) return 0;
  const paid = selectPaymentsForRO(roId).reduce((acc, p) => acc + p.amount, 0);
  return Math.max(0, ro.total - paid);
}

// Convenience re-exports so consumers don't need to also import seed data
export { seedCustomers as customers, seedVehicles as vehicles };
