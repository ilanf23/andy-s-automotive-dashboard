export type InspectionItemStatus = "green" | "yellow" | "red" | "na" | "unset";

export type InspectionItem = {
  id: string;
  category: string;
  name: string;
  status: InspectionItemStatus;
  notes?: string;
  hasPhoto?: boolean;
};

export type Inspection = {
  id: string;
  repairOrderId: string;
  technicianId: string;
  completedAt?: string;
  items: InspectionItem[];
};

// ===== HERO INSPECTION =====
// 37 items total
// Categories: Lights (5), Tires (4), Brakes (4), Fluids (4), Belts & Hoses (4),
//             Filters (3), Suspension (3), Steering (2), Exhaust (3), Battery (2), Safety (3)
// Breakdown: 2 red, 3 yellow, 28 green, 4 NA
const heroItems: InspectionItem[] = [
  // ----- Lights (5) -----
  { id: "INS-4847-01", category: "Lights", name: "Headlights — low/high beam", status: "green" },
  { id: "INS-4847-02", category: "Lights", name: "Brake lights", status: "green" },
  { id: "INS-4847-03", category: "Lights", name: "Turn signals (all corners)", status: "green" },
  {
    id: "INS-4847-04",
    category: "Lights",
    name: "Marker light — driver side rear",
    status: "yellow",
    notes: "LED out, replacement available — 5 min job",
    hasPhoto: true,
  },
  { id: "INS-4847-05", category: "Lights", name: "Emergency lighting (modular body)", status: "green" },

  // ----- Tires (4) -----
  { id: "INS-4847-06", category: "Tires", name: "Front tires — tread depth", status: "green", notes: "8/32 driver, 9/32 passenger" },
  { id: "INS-4847-07", category: "Tires", name: "Rear tires — tread depth", status: "green", notes: "10/32 inner & outer" },
  { id: "INS-4847-08", category: "Tires", name: "Tire pressure (all positions)", status: "green" },
  { id: "INS-4847-09", category: "Tires", name: "Spare tire condition", status: "na" },

  // ----- Brakes (4) -----
  {
    id: "INS-4847-10",
    category: "Brakes",
    name: "Brake pads — front",
    status: "red",
    notes: "Metal-on-metal driver side, 2mm passenger — replace immediately",
    hasPhoto: true,
  },
  { id: "INS-4847-11", category: "Brakes", name: "Brake pads — rear", status: "green", notes: "7mm — recheck next service" },
  { id: "INS-4847-12", category: "Brakes", name: "Brake rotors — front", status: "green", notes: "Within spec but recommend turn with pad job" },
  { id: "INS-4847-13", category: "Brakes", name: "Brake fluid", status: "green" },

  // ----- Fluids (4) -----
  { id: "INS-4847-14", category: "Fluids", name: "Engine oil (level & condition)", status: "green", notes: "Recommend service — within 500mi window" },
  { id: "INS-4847-15", category: "Fluids", name: "Coolant level & condition", status: "green" },
  { id: "INS-4847-16", category: "Fluids", name: "Power steering fluid", status: "green" },
  { id: "INS-4847-17", category: "Fluids", name: "Transmission fluid", status: "green" },

  // ----- Belts & Hoses (4) -----
  { id: "INS-4847-18", category: "Belts & Hoses", name: "Serpentine belt", status: "green" },
  { id: "INS-4847-19", category: "Belts & Hoses", name: "Upper radiator hose", status: "green" },
  { id: "INS-4847-20", category: "Belts & Hoses", name: "Lower radiator hose", status: "green" },
  { id: "INS-4847-21", category: "Belts & Hoses", name: "Heater hoses", status: "green" },

  // ----- Filters (3) -----
  { id: "INS-4847-22", category: "Filters", name: "Engine air filter", status: "green" },
  {
    id: "INS-4847-23",
    category: "Filters",
    name: "Cabin air filter",
    status: "yellow",
    notes: "Heavily soiled — replace at next visit, $85",
    hasPhoto: true,
  },
  { id: "INS-4847-24", category: "Filters", name: "Fuel/water separator", status: "green" },

  // ----- Suspension (3) -----
  { id: "INS-4847-25", category: "Suspension", name: "Front shocks/struts", status: "green" },
  { id: "INS-4847-26", category: "Suspension", name: "Rear shocks", status: "green" },
  { id: "INS-4847-27", category: "Suspension", name: "Bushings & control arms", status: "green" },

  // ----- Steering (2) -----
  { id: "INS-4847-28", category: "Steering", name: "Tie rod ends", status: "green" },
  { id: "INS-4847-29", category: "Steering", name: "Steering gear box / play", status: "green" },

  // ----- Exhaust (3) -----
  { id: "INS-4847-30", category: "Exhaust", name: "Exhaust manifold & gaskets", status: "green" },
  { id: "INS-4847-31", category: "Exhaust", name: "DPF condition", status: "green" },
  { id: "INS-4847-32", category: "Exhaust", name: "DEF system", status: "na", notes: "Not applicable — pre-2010 ambulance chassis exemption documented" },

  // ----- Battery (2) -----
  { id: "INS-4847-33", category: "Battery", name: "Primary battery (cab)", status: "green" },
  { id: "INS-4847-34", category: "Battery", name: "Auxiliary battery (modular)", status: "na", notes: "Tested separately — see modular log" },

  // ----- Safety (3) -----
  {
    id: "INS-4847-35",
    category: "Safety",
    name: "Wiper blades",
    status: "yellow",
    notes: "Streaking both blades — visibility risk in FL summer storms",
    hasPhoto: true,
  },
  {
    id: "INS-4847-36",
    category: "Safety",
    name: "Cabin AC — rear unit not cooling",
    status: "red",
    notes:
      "Rear modular AC blowing warm — compressor cycling, suspect aftermarket condenser failure. Patient compartment risk",
    hasPhoto: true,
  },
  { id: "INS-4847-37", category: "Safety", name: "Seat belts (driver + passenger)", status: "na" },
];

export const inspections: Inspection[] = [
  {
    id: "INS-4847",
    repairOrderId: "4847",
    technicianId: "TECH-ANDRE",
    completedAt: "2026-05-18T14:22:00Z",
    items: heroItems,
  },
  {
    id: "INS-4848",
    repairOrderId: "4848",
    technicianId: "TECH-JOSE",
    completedAt: "2026-05-18T16:40:00Z",
    items: [
      { id: "INS-4848-01", category: "Lights", name: "Brake lights", status: "green" },
      { id: "INS-4848-02", category: "Lights", name: "Box truck rear marker lights", status: "green" },
      {
        id: "INS-4848-03",
        category: "Brakes",
        name: "Brake adjustment — drum rear",
        status: "red",
        notes: "Out of spec, slack adjuster at travel limit",
        hasPhoto: true,
      },
      { id: "INS-4848-04", category: "Tires", name: "Tire condition (all 6)", status: "green" },
      {
        id: "INS-4848-05",
        category: "Hydraulics",
        name: "Lift gate cylinder seals",
        status: "yellow",
        notes: "Weeping — pre-failure",
      },
      { id: "INS-4848-06", category: "Fluids", name: "Engine oil", status: "green" },
      { id: "INS-4848-07", category: "Fluids", name: "Hydraulic fluid (lift gate)", status: "green" },
    ],
  },
  {
    id: "INS-4849",
    repairOrderId: "4849",
    technicianId: "TECH-MARCUS",
    completedAt: "2026-05-19T11:15:00Z",
    items: [
      { id: "INS-4849-01", category: "Filters", name: "Fuel/water separator", status: "yellow", notes: "Due for replacement — 250 idle hours" },
      { id: "INS-4849-02", category: "Filters", name: "Oil filter", status: "yellow", notes: "Weekly service due" },
      { id: "INS-4849-03", category: "Fluids", name: "Engine oil", status: "green" },
      { id: "INS-4849-04", category: "Exhaust", name: "DEF system — code 4364", status: "green", notes: "Reset after sensor swap" },
      { id: "INS-4849-05", category: "Hydraulics", name: "Jetter pump pressure", status: "green" },
    ],
  },
];
