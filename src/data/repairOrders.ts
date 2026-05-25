import type { ShopStatus } from "@/components/shop/StatusBadge";

export type RepairOrder = {
  id: string; // RO number, e.g. "4847"
  customerId: string;
  vehicleId: string;
  technicianId?: string;
  status: ShopStatus;
  total: number;
  daysInShop: number;
  openedAt: string; // ISO
  closedAt?: string;
  description: string;
  flags?: string[]; // e.g. ["Lost Revenue Risk"]
  inspectionFindings?: {
    red: number;
    yellow: number;
    green: number;
    estimated: number;
  };
};

export const repairOrders: RepairOrder[] = [
  // ===== ANCHOR RO =====
  {
    id: "4847",
    customerId: "CUST-MED",
    vehicleId: "VEH-MT47",
    technicianId: "TECH-ANDRE",
    status: "awaiting-approval",
    total: 1850,
    daysInShop: 3,
    openedAt: "2026-05-17",
    description: "Brake service + AC issue",
    flags: ["Lost Revenue Risk"],
    inspectionFindings: { red: 2, yellow: 3, green: 28, estimated: 1 },
  },

  // ===== ESTIMATES TAB (estimate-building, awaiting-approval) =====
  {
    id: "4851",
    customerId: "CUST-FORMTECH",
    vehicleId: "VEH-FT3",
    technicianId: "TECH-MARCUS",
    status: "estimate-building",
    total: 7280,
    daysInShop: 2,
    openedAt: "2026-05-18",
    description:
      "Transmission slipping + coolant leak — Frankenstein build, no OEM labor guide",
    flags: ["Frankenstein vehicle — labor guide unavailable"],
    inspectionFindings: { red: 3, yellow: 4, green: 19, estimated: 4 },
  },
  {
    id: "4849",
    customerId: "CUST-DUCKS",
    vehicleId: "VEH-RD12",
    technicianId: "TECH-MARCUS",
    status: "estimate-building",
    total: 890,
    daysInShop: 1,
    openedAt: "2026-05-19",
    description: "Scheduled idle-hour service + DEF code 4364",
    inspectionFindings: { red: 0, yellow: 2, green: 24, estimated: 2 },
  },
  {
    id: "4845",
    customerId: "CUST-FCS",
    vehicleId: "VEH-FCS118",
    technicianId: "TECH-JOSE",
    status: "awaiting-approval",
    total: 3420,
    daysInShop: 4,
    openedAt: "2026-05-16",
    description: "Air brake system service + ABS sensor replacement",
    inspectionFindings: { red: 1, yellow: 2, green: 26, estimated: 3 },
  },

  // ===== WORK IN PROGRESS (just-arrived, inspection, in-progress) =====
  {
    id: "4852",
    customerId: "CUST-MED",
    vehicleId: "VEH-MT52",
    status: "just-arrived",
    total: 0,
    daysInShop: 0,
    openedAt: "2026-05-20",
    description: "Check-in only — driver reports rear AC weak, intermittent",
  },
  {
    id: "4848",
    customerId: "CUST-CITY",
    vehicleId: "VEH-CF304",
    technicianId: "TECH-JOSE",
    status: "in-progress",
    total: 4200,
    daysInShop: 2,
    openedAt: "2026-05-18",
    description: "Lift gate replacement + brake adjustment",
    inspectionFindings: { red: 1, yellow: 1, green: 30, estimated: 2 },
  },
  {
    id: "4846",
    customerId: "CUST-FSCJ",
    vehicleId: "VEH-FSCJ09",
    technicianId: "TECH-TREVOR",
    status: "inspection",
    total: 0,
    daysInShop: 1,
    openedAt: "2026-05-19",
    description: "Initial fleet onboarding inspection — first visit",
  },
  {
    id: "4844",
    customerId: "CUST-BAYSIDE",
    vehicleId: "VEH-BAY01",
    technicianId: "TECH-TREVOR",
    status: "in-progress",
    total: 1180,
    daysInShop: 2,
    openedAt: "2026-05-18",
    description: "Trailer brake controller + fluid services",
  },
  {
    id: "4843",
    customerId: "CUST-COASTAL",
    vehicleId: "VEH-COA01",
    technicianId: "TECH-DANNY",
    status: "in-progress",
    total: 720,
    daysInShop: 1,
    openedAt: "2026-05-19",
    description: "30k mile service + alignment",
  },

  // ===== COMPLETED / READY =====
  {
    id: "4840",
    customerId: "CUST-DAVY",
    vehicleId: "VEH-DT7",
    technicianId: "TECH-JOSE",
    status: "completed",
    total: 6700,
    daysInShop: 5,
    openedAt: "2026-05-08",
    closedAt: "2026-05-13",
    description: "Hydraulic cylinder reseal + cone holder weld repair",
    inspectionFindings: { red: 0, yellow: 1, green: 31, estimated: 1 },
  },
  {
    id: "4842",
    customerId: "CUST-CITY",
    vehicleId: "VEH-CF221",
    technicianId: "TECH-MARCUS",
    status: "ready",
    total: 2840,
    daysInShop: 3,
    openedAt: "2026-05-15",
    description: "Power steering pump + serpentine belt",
  },
  {
    id: "4838",
    customerId: "CUST-ATLANTIC",
    vehicleId: "VEH-ATL01",
    technicianId: "TECH-TREVOR",
    status: "completed",
    total: 1420,
    daysInShop: 2,
    openedAt: "2026-04-20",
    closedAt: "2026-04-22",
    description: "Front brake pads + rotor turn",
  },
];
