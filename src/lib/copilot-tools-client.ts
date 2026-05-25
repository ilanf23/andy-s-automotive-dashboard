import { toast } from "sonner";
import {
  getShopState,
  createRepairOrder,
  updateROStatus,
  applyPayment,
  applyAIEstimateLines,
  postRepairOrder,
  customers as seedCustomers,
  vehicles as seedVehicles,
} from "./shop-store";
import { estimates as seedEstimates } from "@/data/estimates";
import { inspections as seedInspections } from "@/data/inspections";
import { TOOL_META, type ShopSnapshot } from "./copilot-tools";
import type { ShopStatus } from "@/components/shop/StatusBadge";

// ============================================================================
// Tool executor map. Each tool returns whatever should be serialized back to
// the model as the tool result.
// ============================================================================

type ToolExecutor = {
  requiresApproval: boolean;
  execute: (
    args: Record<string, unknown>,
    ctx: { navigate: (path: string) => void },
  ) => unknown | Promise<unknown>;
};

const meta = (name: string) => TOOL_META[name] ?? { requiresApproval: false };

export const TOOLS: Record<string, ToolExecutor> = {
  // --------------------------------------------------------------------------
  // READS
  // --------------------------------------------------------------------------
  list_repair_orders: {
    requiresApproval: meta("list_repair_orders").requiresApproval,
    execute: (args) => {
      const { status, technicianId } = args as { status?: string; technicianId?: string };
      const ros = getShopState().repairOrders.filter((r) => {
        if (status && r.status !== status) return false;
        if (technicianId && r.technicianId !== technicianId) return false;
        return true;
      });
      return ros.slice(0, 50).map((r) => ({
        id: r.id,
        customerId: r.customerId,
        vehicleId: r.vehicleId,
        technicianId: r.technicianId,
        status: r.status,
        total: r.total,
        daysInShop: r.daysInShop,
        description: r.description,
      }));
    },
  },

  get_repair_order: {
    requiresApproval: meta("get_repair_order").requiresApproval,
    execute: (args) => {
      const { id } = args as { id: string };
      const ro = getShopState().repairOrders.find((r) => r.id === id);
      if (!ro) return { error: `RO ${id} not found` };
      return ro;
    },
  },

  list_customers: {
    requiresApproval: meta("list_customers").requiresApproval,
    execute: (args) => {
      const { search } = args as { search?: string };
      const needle = search?.toLowerCase();
      return seedCustomers
        .filter((c) => (needle ? c.name.toLowerCase().includes(needle) : true))
        .slice(0, 50)
        .map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          contactName: c.contactName,
          email: c.email,
          phone: c.phone,
          lifetimeValue: c.lifetimeValue,
          openBalance: c.openBalance,
          trucksInShop: c.trucksInShop,
        }));
    },
  },

  get_customer: {
    requiresApproval: meta("get_customer").requiresApproval,
    execute: (args) => {
      const { id } = args as { id: string };
      const c = seedCustomers.find((x) => x.id === id);
      return c ?? { error: `Customer ${id} not found` };
    },
  },

  list_vehicles: {
    requiresApproval: meta("list_vehicles").requiresApproval,
    execute: (args) => {
      const { customerId } = args as { customerId?: string };
      return seedVehicles
        .filter((v) => (customerId ? v.customerId === customerId : true))
        .slice(0, 50)
        .map((v) => ({
          id: v.id,
          unit: v.unit,
          year: v.year,
          make: v.make,
          model: v.model,
          customerId: v.customerId,
          mileage: v.mileage,
        }));
    },
  },

  get_vehicle: {
    requiresApproval: meta("get_vehicle").requiresApproval,
    execute: (args) => {
      const { id } = args as { id: string };
      const v = seedVehicles.find((x) => x.id === id);
      return v ?? { error: `Vehicle ${id} not found` };
    },
  },

  list_estimates: {
    requiresApproval: meta("list_estimates").requiresApproval,
    execute: (args) => {
      const { status } = args as { status?: string };
      return seedEstimates
        .filter((e) => (status ? e.status === status : true))
        .slice(0, 50)
        .map((e) => ({
          id: e.id,
          repairOrderId: e.repairOrderId,
          customerId: e.customerId,
          status: e.status,
          subtotal: e.subtotal,
          total: e.total,
          lineCount: e.lineItems.length,
        }));
    },
  },

  get_estimate: {
    requiresApproval: meta("get_estimate").requiresApproval,
    execute: (args) => {
      const { id } = args as { id: string };
      const e = seedEstimates.find((x) => x.id === id);
      return e ?? { error: `Estimate ${id} not found` };
    },
  },

  list_inspections: {
    requiresApproval: meta("list_inspections").requiresApproval,
    execute: () => {
      return seedInspections.slice(0, 50).map((i) => {
        const counts = i.items.reduce(
          (acc, it) => {
            acc[it.status] += 1;
            return acc;
          },
          { red: 0, yellow: 0, green: 0, na: 0 } as Record<string, number>,
        );
        return {
          id: i.id,
          repairOrderId: i.repairOrderId,
          technicianId: i.technicianId,
          completedAt: i.completedAt,
          itemCounts: counts,
        };
      });
    },
  },

  get_today_schedule: {
    requiresApproval: meta("get_today_schedule").requiresApproval,
    execute: () => {
      // "Today's schedule" = ROs currently in the shop (not yet completed)
      return getShopState()
        .repairOrders.filter((r) => r.status !== "completed")
        .slice(0, 50)
        .map((r) => ({
          roId: r.id,
          customerId: r.customerId,
          vehicleId: r.vehicleId,
          technicianId: r.technicianId,
          status: r.status,
          daysInShop: r.daysInShop,
          description: r.description,
        }));
    },
  },

  // --------------------------------------------------------------------------
  // WRITES (each guarded by an approval card)
  // --------------------------------------------------------------------------

  create_repair_order: {
    requiresApproval: meta("create_repair_order").requiresApproval,
    execute: (args) => {
      const { customerId, vehicleId, complaint } = args as {
        customerId: string;
        vehicleId: string;
        complaint: string;
      };
      const ro = createRepairOrder({
        customerId,
        vehicleId,
        description: complaint,
      });
      toast.success(`Created RO ${ro.id}`, { description: complaint });
      return { ok: true, roId: ro.id, status: ro.status };
    },
  },

  update_ro_status: {
    requiresApproval: meta("update_ro_status").requiresApproval,
    execute: (args) => {
      const { id, status } = args as { id: string; status: string };
      updateROStatus(id, status as ShopStatus);
      toast.success(`RO ${id} → ${status}`);
      return { ok: true, id, status };
    },
  },

  send_estimate: {
    requiresApproval: meta("send_estimate").requiresApproval,
    execute: (args) => {
      const { estimateId, channels } = args as { estimateId: string; channels: string[] };
      toast.success(`Estimate ${estimateId} sent`, {
        description: `Channels: ${channels.join(", ")}`,
      });
      return { ok: true, estimateId, channels, sentAt: new Date().toISOString() };
    },
  },

  take_payment: {
    requiresApproval: meta("take_payment").requiresApproval,
    execute: (args) => {
      const { roId, amount, method } = args as {
        roId: string;
        amount: number;
        method: "Card" | "ACH" | "Cash" | "Check";
      };
      const payment = applyPayment({ roId, amount, method });
      toast.success(`Payment recorded`, {
        description: `$${amount.toFixed(2)} (${method}) on RO ${roId}`,
      });
      return { ok: true, paymentId: payment.id, amount, method };
    },
  },

  post_ro: {
    requiresApproval: meta("post_ro").requiresApproval,
    execute: (args) => {
      const { id } = args as { id: string };
      postRepairOrder(id);
      toast.success(`RO ${id} posted (closed)`);
      return { ok: true, id };
    },
  },

  add_estimate_lines: {
    requiresApproval: meta("add_estimate_lines").requiresApproval,
    execute: (args) => {
      const { roId, lines } = args as {
        roId: string;
        lines: Array<{
          description: string;
          partNumber?: string;
          partVendor?: string;
          partPrice: number;
          laborHours: number;
          laborRate: number;
          total: number;
        }>;
      };
      const result = applyAIEstimateLines({
        roId,
        lines,
        minutesSaved: lines.length * 8,
      });
      toast.success(`Added ${result.linesAdded} lines to RO ${roId}`, {
        description: `+$${result.dollarsAdded.toFixed(2)}`,
      });
      return { ok: true, ...result };
    },
  },

  navigate_to: {
    requiresApproval: meta("navigate_to").requiresApproval,
    execute: (args, ctx) => {
      const { path } = args as { path: string };
      ctx.navigate(path);
      toast.success(`Navigating`, { description: path });
      return { ok: true, path };
    },
  },
};

// ============================================================================
// Build a compact snapshot of shop state to feed to the model as context.
// Each list is capped at 20 entries with only the most useful fields.
// ============================================================================

export function buildSnapshot(): ShopSnapshot {
  const st = getShopState();
  const inspections: ShopSnapshot["inspections"] = seedInspections.slice(0, 20).map((i) => {
    const counts = i.items.reduce(
      (acc, it) => {
        acc[it.status] += 1;
        return acc;
      },
      { red: 0, yellow: 0, green: 0, na: 0 } as Record<string, number>,
    );
    return {
      id: i.id,
      repairOrderId: i.repairOrderId,
      technicianId: i.technicianId,
      completedAt: i.completedAt,
      itemCounts: counts as { red: number; yellow: number; green: number; na: number },
    };
  });

  return {
    repairOrders: st.repairOrders.slice(0, 20).map((r) => ({
      id: r.id,
      customerId: r.customerId,
      vehicleId: r.vehicleId,
      technicianId: r.technicianId,
      status: r.status,
      total: r.total,
      daysInShop: r.daysInShop,
      description: r.description,
    })),
    customers: seedCustomers.slice(0, 20).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      openBalance: c.openBalance,
      lifetimeValue: c.lifetimeValue,
    })),
    vehicles: seedVehicles.slice(0, 20).map((v) => ({
      id: v.id,
      unit: v.unit,
      year: v.year,
      make: v.make,
      model: v.model,
      customerId: v.customerId,
    })),
    estimates: seedEstimates.slice(0, 20).map((e) => ({
      id: e.id,
      repairOrderId: e.repairOrderId,
      customerId: e.customerId,
      status: e.status,
      total: e.total,
    })),
    inspections,
    todaySchedule: st.repairOrders
      .filter((r) => r.status !== "completed")
      .slice(0, 20)
      .map((r) => ({
        roId: r.id,
        customerId: r.customerId,
        vehicleId: r.vehicleId,
        status: r.status,
        technicianId: r.technicianId,
      })),
  };
}
