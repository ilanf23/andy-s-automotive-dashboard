// ============================================================================
// Copilot tool schema — shared between server (OpenAI request) and client
// (tool executor). The JSON schemas conform to OpenAI's tools format.
//
// The TOOL_META map carries metadata that's NOT part of OpenAI's schema —
// namely, whether a tool requires user approval before execution and a
// human-friendly title for the approval card.
// ============================================================================

export type OpenAITool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
      additionalProperties?: false;
    };
  };
};

export type ToolMeta = {
  requiresApproval: boolean;
  /** Short label for the approval card title */
  title?: string;
  /** "default" | "danger" | "success" — visual tone for the approval card */
  tone?: "default" | "danger" | "success";
};

// ----------------------------------------------------------------------------
// READ tools — executed silently on the client, results streamed back to model
// ----------------------------------------------------------------------------

const READ_TOOLS: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "list_repair_orders",
      description:
        "List repair orders, optionally filtered by status (e.g. 'in-progress', 'awaiting-approval', 'estimate-building', 'ready', 'completed', 'just-arrived', 'inspection') or by technicianId (e.g. 'TECH-MARCUS').",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Optional ShopStatus filter." },
          technicianId: { type: "string", description: "Optional technician ID filter." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_repair_order",
      description:
        "Get a single repair order by its RO id (e.g. '4847'). Returns full details including customer, vehicle, total, status, inspection findings.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "RO id, e.g. '4847'." } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_customers",
      description:
        "List customers. Optionally pass a search string to filter by name (case-insensitive substring match).",
      parameters: {
        type: "object",
        properties: { search: { type: "string", description: "Optional name substring." } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer",
      description: "Get a single customer by id (e.g. 'CUST-MED').",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_vehicles",
      description:
        "List vehicles. Optionally filter by customerId to see all trucks owned by a fleet.",
      parameters: {
        type: "object",
        properties: { customerId: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_vehicle",
      description: "Get a single vehicle by id (e.g. 'VEH-MT47').",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_estimates",
      description:
        "List estimates, optionally filtered by status ('draft', 'sent', 'approved', 'declined', 'partially-approved').",
      parameters: {
        type: "object",
        properties: { status: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_estimate",
      description: "Get a single estimate by id with all line items.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_inspections",
      description: "List digital vehicle inspections (DVIs).",
      parameters: {
        type: "object",
        properties: { status: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_today_schedule",
      description:
        "Get today's schedule — repair orders currently in the shop with their assigned technician, status, and customer.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

// ----------------------------------------------------------------------------
// WRITE tools — paused for approval before execution. The exception is
// `navigate_to`, which is benign and runs without approval.
// ----------------------------------------------------------------------------

const WRITE_TOOLS: OpenAITool[] = [
  {
    type: "function",
    function: {
      name: "create_repair_order",
      description:
        "Create a new repair order. Requires a known customerId and vehicleId — look these up first if needed.",
      parameters: {
        type: "object",
        properties: {
          customerId: { type: "string" },
          vehicleId: { type: "string" },
          complaint: { type: "string", description: "Customer complaint or job description." },
        },
        required: ["customerId", "vehicleId", "complaint"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ro_status",
      description:
        "Update the status of a repair order. Valid statuses: 'in-progress', 'awaiting-approval', 'estimate-building', 'ai-estimated', 'inspection', 'ready', 'completed', 'just-arrived'.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string" },
        },
        required: ["id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_estimate",
      description:
        "Send an estimate to the customer via the specified channels (sms, email). Simulated send — emits a toast.",
      parameters: {
        type: "object",
        properties: {
          estimateId: { type: "string" },
          channels: {
            type: "array",
            items: { type: "string", enum: ["sms", "email"] },
            description: "One or more delivery channels.",
          },
        },
        required: ["estimateId", "channels"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "take_payment",
      description:
        "Record a payment against a repair order. Method must be one of 'Card', 'ACH', 'Cash', 'Check'.",
      parameters: {
        type: "object",
        properties: {
          roId: { type: "string" },
          amount: { type: "number" },
          method: { type: "string", enum: ["Card", "ACH", "Cash", "Check"] },
        },
        required: ["roId", "amount", "method"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "post_ro",
      description:
        "Post (close) a repair order — marks it completed and stamps the close date. Use this after the customer pays and picks up the truck.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_estimate_lines",
      description:
        "Add AI-generated estimate lines to a repair order. Each line needs description, partPrice, laborHours, laborRate, and total.",
      parameters: {
        type: "object",
        properties: {
          roId: { type: "string" },
          lines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                partNumber: { type: "string" },
                partVendor: { type: "string" },
                partPrice: { type: "number" },
                laborHours: { type: "number" },
                laborRate: { type: "number" },
                total: { type: "number" },
              },
              required: ["description", "partPrice", "laborHours", "laborRate", "total"],
            },
          },
        },
        required: ["roId", "lines"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description:
        "Navigate the user to a route in the app, e.g. '/repair-orders/4847', '/customers/CUST-MED', '/dashboard'. Benign — no approval needed.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
];

export const TOOL_SCHEMA: OpenAITool[] = [...READ_TOOLS, ...WRITE_TOOLS];

export const TOOL_META: Record<string, ToolMeta> = {
  // Reads
  list_repair_orders: { requiresApproval: false },
  get_repair_order: { requiresApproval: false },
  list_customers: { requiresApproval: false },
  get_customer: { requiresApproval: false },
  list_vehicles: { requiresApproval: false },
  get_vehicle: { requiresApproval: false },
  list_estimates: { requiresApproval: false },
  get_estimate: { requiresApproval: false },
  list_inspections: { requiresApproval: false },
  get_today_schedule: { requiresApproval: false },
  // Writes
  create_repair_order: { requiresApproval: true, title: "Create repair order", tone: "default" },
  update_ro_status: { requiresApproval: true, title: "Update RO status", tone: "default" },
  send_estimate: { requiresApproval: true, title: "Send estimate to customer", tone: "default" },
  take_payment: { requiresApproval: true, title: "Take payment", tone: "success" },
  post_ro: { requiresApproval: true, title: "Post (close) repair order", tone: "success" },
  add_estimate_lines: { requiresApproval: true, title: "Add estimate lines", tone: "default" },
  navigate_to: { requiresApproval: false },
};

// ============================================================================
// Snapshot type — compact shop state passed to the model as context
// ============================================================================

export type ShopSnapshot = {
  repairOrders: Array<{
    id: string;
    customerId: string;
    vehicleId: string;
    technicianId?: string;
    status: string;
    total: number;
    daysInShop: number;
    description: string;
  }>;
  customers: Array<{
    id: string;
    name: string;
    type: string;
    openBalance: number;
    lifetimeValue: number;
  }>;
  vehicles: Array<{
    id: string;
    unit: string;
    year: number;
    make: string;
    model: string;
    customerId: string;
  }>;
  estimates: Array<{
    id: string;
    repairOrderId: string;
    customerId: string;
    status: string;
    total: number;
  }>;
  inspections: Array<{
    id: string;
    repairOrderId: string;
    technicianId: string;
    completedAt?: string;
    itemCounts: { red: number; yellow: number; green: number; na: number };
  }>;
  todaySchedule: Array<{
    roId: string;
    customerId: string;
    vehicleId: string;
    status: string;
    technicianId?: string;
  }>;
};

// ============================================================================
// Chat message type that matches OpenAI's wire format
// ============================================================================

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

// ============================================================================
// System prompt — short, focused
// ============================================================================

export const SYSTEM_PROMPT = `You are the AI Copilot for Andy's Automotive — a heavy-duty truck repair shop.
Your job: help the service advisor and shop manager run their day. You can read all shop data and take real actions (creating repair orders, sending estimates, taking payments, etc.) through the available tools.

Rules:
- Be concise. Two sentences when one will do.
- When you take an action, say what you did briefly.
- For write actions, the system will pause for the user to approve before executing — that's expected, don't apologize for it.
- If you don't have enough info, ask one short clarifying question.
- Use the customer's preferred terminology (RO = repair order, ARO = avg repair order, ELR = effective labor rate, DVI = digital vehicle inspection).
- Never invent IDs, prices, or customer details. Look them up via the tools or use the CURRENT SHOP STATE snapshot you were given.
- Prefer the snapshot for quick lookups; use tools when you need the full record or to take an action.`;
