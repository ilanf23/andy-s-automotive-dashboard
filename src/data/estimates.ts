export type EstimateLineItem = {
  id: string;
  description: string;
  partNumber?: string;
  vendor?: string;
  qty: number;
  partPrice: number;
  laborHours: number;
  laborPrice: number;
  total: number;
  status: "pending" | "authorized" | "declined";
  aiEstimated?: boolean;
};

export type Estimate = {
  id: string;
  repairOrderId: string;
  customerId: string;
  vehicleId: string;
  createdAt: string;
  status: "draft" | "sent" | "approved" | "declined" | "partially-approved";
  lineItems: EstimateLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  sentToFleetManager?: boolean;
};

export const estimates: Estimate[] = [
  // ===== HERO ESTIMATE - intentionally thin (only oil change) =====
  {
    id: "EST-4847",
    repairOrderId: "4847",
    customerId: "CUST-MED",
    vehicleId: "VEH-MT47",
    createdAt: "2026-05-18T15:10:00Z",
    status: "sent",
    sentToFleetManager: true,
    lineItems: [
      {
        id: "EST-4847-L1",
        description: "Diesel Oil & Filter Service (Ambulance E-450)",
        partNumber: "LF9001 + FF5485",
        vendor: "Cummins Direct",
        qty: 1,
        partPrice: 138.0,
        laborHours: 1.5,
        laborPrice: 210.0,
        total: 348.0,
        status: "pending",
      },
    ],
    subtotal: 348.0,
    tax: 24.36,
    total: 372.36,
  },

  // ===== Frankenstein truck - AI-estimated line items =====
  {
    id: "EST-FT3-001",
    repairOrderId: "4851",
    customerId: "CUST-FORMTECH",
    vehicleId: "VEH-FT3",
    createdAt: "2026-05-18T17:45:00Z",
    status: "draft",
    lineItems: [
      {
        id: "EST-FT3-L1",
        description: "Transmission rebuild - Allison 3000 (AI labor estimate, no OEM time)",
        qty: 1,
        partPrice: 3850.0,
        laborHours: 14.0,
        laborPrice: 1960.0,
        total: 5810.0,
        status: "pending",
        aiEstimated: true,
      },
      {
        id: "EST-FT3-L2",
        description: "Coolant leak diagnostic + radiator core replacement",
        qty: 1,
        partPrice: 420.0,
        laborHours: 3.5,
        laborPrice: 490.0,
        total: 910.0,
        status: "pending",
        aiEstimated: true,
      },
      {
        id: "EST-FT3-L3",
        description: "Custom-fab hose routing (Frankenstein chassis)",
        qty: 1,
        partPrice: 145.0,
        laborHours: 2.0,
        laborPrice: 280.0,
        total: 425.0,
        status: "pending",
        aiEstimated: true,
      },
      {
        id: "EST-FT3-L4",
        description: "Coolant 50/50 ELC refill (3gal)",
        partNumber: "COOL-50",
        vendor: "NAPA",
        qty: 3,
        partPrice: 55.5,
        laborHours: 0,
        laborPrice: 0,
        total: 55.5,
        status: "pending",
      },
    ],
    subtotal: 7200.5,
    tax: 504.04,
    total: 7704.54,
  },

  // ===== City Form 304 - approved estimate, multi-line =====
  {
    id: "EST-CF304",
    repairOrderId: "4848",
    customerId: "CUST-CITY",
    vehicleId: "VEH-CF304",
    createdAt: "2026-05-17T09:30:00Z",
    status: "approved",
    sentToFleetManager: true,
    lineItems: [
      {
        id: "EST-CF304-L1",
        description: "Lift gate hydraulic cylinder reseal",
        partNumber: "HYD-SEAL3",
        vendor: "WorldPac",
        qty: 1,
        partPrice: 84.0,
        laborHours: 4.0,
        laborPrice: 560.0,
        total: 644.0,
        status: "authorized",
      },
      {
        id: "EST-CF304-L2",
        description: "Hydraulic fluid AW46 (5gal)",
        partNumber: "AW46-5G",
        vendor: "WorldPac",
        qty: 1,
        partPrice: 86.5,
        laborHours: 0,
        laborPrice: 0,
        total: 86.5,
        status: "authorized",
      },
      {
        id: "EST-CF304-L3",
        description: "Rear brake adjustment - slack adjuster replacement",
        qty: 2,
        partPrice: 142.0,
        laborHours: 2.0,
        laborPrice: 280.0,
        total: 564.0,
        status: "authorized",
      },
      {
        id: "EST-CF304-L4",
        description: "Air dryer cartridge replacement",
        partNumber: "AIRDRY-AD9",
        vendor: "Detroit Diesel",
        qty: 1,
        partPrice: 78.0,
        laborHours: 1.0,
        laborPrice: 140.0,
        total: 218.0,
        status: "authorized",
      },
      {
        id: "EST-CF304-L5",
        description: "DOT inspection + cert sticker",
        qty: 1,
        partPrice: 0,
        laborHours: 1.0,
        laborPrice: 140.0,
        total: 140.0,
        status: "authorized",
      },
      {
        id: "EST-CF304-L6",
        description: "Diesel Oil & Filter Service",
        partNumber: "LF9001",
        vendor: "Cummins Direct",
        qty: 1,
        partPrice: 124.0,
        laborHours: 1.5,
        laborPrice: 210.0,
        total: 334.0,
        status: "authorized",
      },
    ],
    subtotal: 1986.5,
    tax: 139.06,
    total: 2125.56,
  },

  // ===== Davy Tree DT-7 - completed estimate =====
  {
    id: "EST-DT7",
    repairOrderId: "4840",
    customerId: "CUST-DAVY",
    vehicleId: "VEH-DT7",
    createdAt: "2026-05-08T08:00:00Z",
    status: "approved",
    sentToFleetManager: true,
    lineItems: [
      {
        id: "EST-DT7-L1",
        description: "Hydraulic cylinder reseal - boom main lift",
        partNumber: "HYD-SEAL4",
        vendor: "WorldPac",
        qty: 1,
        partPrice: 112.0,
        laborHours: 4.0,
        laborPrice: 560.0,
        total: 672.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L2",
        description: "Hydraulic fluid AW46 (10gal)",
        partNumber: "AW46-5G",
        vendor: "WorldPac",
        qty: 2,
        partPrice: 173.0,
        laborHours: 0,
        laborPrice: 0,
        total: 173.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L3",
        description: "Cone holder weld repair + re-fabrication (in-house)",
        qty: 1,
        partPrice: 280.0,
        laborHours: 6.0,
        laborPrice: 840.0,
        total: 1120.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L4",
        description: "Bucket control valve replacement",
        qty: 1,
        partPrice: 1840.0,
        laborHours: 3.5,
        laborPrice: 490.0,
        total: 2330.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L5",
        description: "Annual ANSI A92.2 dielectric test + cert",
        qty: 1,
        partPrice: 0,
        laborHours: 4.0,
        laborPrice: 560.0,
        total: 560.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L6",
        description: "Diesel Oil & Filter Service (F-750)",
        partNumber: "LF9001",
        vendor: "Cummins Direct",
        qty: 1,
        partPrice: 148.0,
        laborHours: 1.5,
        laborPrice: 210.0,
        total: 358.0,
        status: "authorized",
      },
      {
        id: "EST-DT7-L7",
        description: "Front brake pad replacement",
        partNumber: "HDPAD-F",
        vendor: "WorldPac",
        qty: 1,
        partPrice: 142.0,
        laborHours: 2.5,
        laborPrice: 350.0,
        total: 492.0,
        status: "authorized",
      },
    ],
    subtotal: 5705.0,
    tax: 399.35,
    total: 6104.35,
  },
];
