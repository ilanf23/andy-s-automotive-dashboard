export type InspectionTemplateItem = {
  category: string;
  name: string;
};

export type InspectionTemplate = {
  id: string;
  name: string;
  description: string;
  items: InspectionTemplateItem[];
};

const dvi37Items: InspectionTemplateItem[] = [
  { category: "Lights", name: "Headlights — low/high beam" },
  { category: "Lights", name: "Brake lights" },
  { category: "Lights", name: "Turn signals (all corners)" },
  { category: "Lights", name: "Marker lights" },
  { category: "Lights", name: "Emergency / hazard lighting" },

  { category: "Tires", name: "Front tires — tread depth" },
  { category: "Tires", name: "Rear tires — tread depth" },
  { category: "Tires", name: "Tire pressure (all positions)" },
  { category: "Tires", name: "Spare tire condition" },

  { category: "Brakes", name: "Brake pads — front" },
  { category: "Brakes", name: "Brake pads — rear" },
  { category: "Brakes", name: "Brake rotors — front" },
  { category: "Brakes", name: "Brake fluid" },

  { category: "Fluids", name: "Engine oil (level & condition)" },
  { category: "Fluids", name: "Coolant level & condition" },
  { category: "Fluids", name: "Power steering fluid" },
  { category: "Fluids", name: "Transmission fluid" },

  { category: "Belts & Hoses", name: "Serpentine belt" },
  { category: "Belts & Hoses", name: "Upper radiator hose" },
  { category: "Belts & Hoses", name: "Lower radiator hose" },
  { category: "Belts & Hoses", name: "Heater hoses" },

  { category: "Filters", name: "Engine air filter" },
  { category: "Filters", name: "Cabin air filter" },
  { category: "Filters", name: "Fuel/water separator" },

  { category: "Suspension", name: "Front shocks/struts" },
  { category: "Suspension", name: "Rear shocks" },
  { category: "Suspension", name: "Bushings & control arms" },

  { category: "Steering", name: "Tie rod ends" },
  { category: "Steering", name: "Steering gear box / play" },

  { category: "Exhaust", name: "Exhaust manifold & gaskets" },
  { category: "Exhaust", name: "DPF condition" },
  { category: "Exhaust", name: "DEF system" },

  { category: "Battery", name: "Primary battery (cab)" },
  { category: "Battery", name: "Auxiliary battery" },

  { category: "Safety", name: "Wiper blades" },
  { category: "Safety", name: "Cabin AC operation" },
  { category: "Safety", name: "Seat belts (driver + passenger)" },
];

export const inspectionTemplates: InspectionTemplate[] = [
  {
    id: "dvi-37",
    name: "37-Point DVI",
    description: "Standard digital vehicle inspection",
    items: dvi37Items,
  },
];

export function getTemplate(id: string): InspectionTemplate | undefined {
  return inspectionTemplates.find((t) => t.id === id);
}
