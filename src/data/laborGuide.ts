/**
 * Mock heavy-duty truck labor-time guide.
 *
 * In a real shop, this data comes from Mitchell 1 / AllData / WorldPac. The
 * numbers here are realistic flat-rate hours for Class 7/8 diesel work — pad
 * R&R on a heavy front axle really is ~2 hrs; an injector swap on a DD15 is
 * really ~7 hrs; a forced regen is really ~1 hr at the keyboard.
 *
 * Used by `CatalogSearchModal` (mode="labor") to populate Add Job / Add Line /
 * New Canned Job modals across the app.
 */

export type LaborGuideEntry = {
  id: string;
  jobCode: string;
  category:
    | "Brakes"
    | "Engine"
    | "Transmission"
    | "Electrical"
    | "HVAC"
    | "Suspension"
    | "Aftertreatment"
    | "Diagnostics"
    | "Maintenance";
  description: string;
  detail: string;
  applicableMakes: string[];
  laborHours: number;
  skillLevel: "A" | "B" | "C";
  notes?: string;
};

export const laborGuide: LaborGuideEntry[] = [
  // ── Brakes (5) ──────────────────────────────────────────────────────────
  {
    id: "lg-001",
    jobCode: "BR-FRT-PAD-001",
    category: "Brakes",
    description: "Replace front brake pads",
    detail:
      "R&R front brake pads on steer axle. Includes caliper inspection, slide-pin lube, hardware replacement, and pad-bed-in road test.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 2.0,
    skillLevel: "B",
    notes: "Check rotor thickness and runout before reassembly.",
  },
  {
    id: "lg-002",
    jobCode: "BR-RR-PAD-002",
    category: "Brakes",
    description: "Replace rear brake pads (drive axle)",
    detail:
      "R&R rear brake pads on drive axle tandem. Includes wheel R&R, caliper inspection, anti-rattle clip replacement.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 2.5,
    skillLevel: "B",
  },
  {
    id: "lg-003",
    jobCode: "BR-DRM-RELN-003",
    category: "Brakes",
    description: "Drum brake reline (per axle)",
    detail:
      "Reline S-cam drum brakes — shoes, return springs, anchor pins, slack adjuster inspection, drum machining if within spec.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 4.5,
    skillLevel: "A",
    notes: "Add 0.5 hr if drums require replacement.",
  },
  {
    id: "lg-004",
    jobCode: "BR-FLD-FLSH-004",
    category: "Brakes",
    description: "Brake fluid flush",
    detail:
      "Full hydraulic brake fluid evacuation and refill with DOT 4. Bleed all corners, verify pedal feel.",
    applicableMakes: ["Ford SD", "Freightliner", "International"],
    laborHours: 1.5,
    skillLevel: "C",
  },
  {
    id: "lg-005",
    jobCode: "BR-ABS-SNS-005",
    category: "Brakes",
    description: "Replace ABS wheel speed sensor",
    detail:
      "R&R single ABS wheel speed sensor including hub clean, sensor seat lube, and J1939 ABS code clear.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 1.0,
    skillLevel: "B",
  },

  // ── Engine (5) ──────────────────────────────────────────────────────────
  {
    id: "lg-006",
    jobCode: "ENG-WP-006",
    category: "Engine",
    description: "Replace water pump",
    detail:
      "R&R engine water pump. Drain coolant, remove serpentine belt, R&R pump, refill with OEM-spec ELC, pressure test, sky temp run.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 3.8,
    skillLevel: "A",
    notes: "Cat C15 and Cummins ISX both fall in the 3.5–4.0 hr range.",
  },
  {
    id: "lg-007",
    jobCode: "ENG-ALT-007",
    category: "Engine",
    description: "Replace alternator",
    detail:
      "R&R 12V/24V alternator. Verify belt tension, charging output (13.8–14.4V), and battery state of charge after install.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.8,
    skillLevel: "B",
  },
  {
    id: "lg-008",
    jobCode: "ENG-STR-008",
    category: "Engine",
    description: "Replace starter motor",
    detail:
      "R&R heavy-duty starter. Disconnect batteries, R&R starter, torque mounting bolts to spec, verify cranking amps.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 2.2,
    skillLevel: "B",
  },
  {
    id: "lg-009",
    jobCode: "ENG-OIL-009",
    category: "Engine",
    description: "Engine oil & filter service",
    detail:
      "Drain and refill engine oil with CK-4 15W-40, R&R primary and secondary (bypass) oil filters, reset oil-life monitor.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.0,
    skillLevel: "C",
    notes: "DD15 and Cat C15 both take ~11 gallons.",
  },
  {
    id: "lg-010",
    jobCode: "ENG-VLV-010",
    category: "Engine",
    description: "Valve lash adjustment",
    detail:
      "Set intake and exhaust valve lash to OEM spec. Includes valve-cover R&R, gasket replacement, and J-brake clearance set on applicable engines.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "Volvo"],
    laborHours: 4.0,
    skillLevel: "A",
    notes: "Recommended every 300k mi on DD15; every 500k on Cat C15.",
  },

  // ── Transmission / Drivetrain (3) ──────────────────────────────────────
  {
    id: "lg-011",
    jobCode: "DT-TRN-SVC-011",
    category: "Transmission",
    description: "Transmission service (fluid + filter)",
    detail:
      "Drain transmission, R&R internal filter and pan gasket, refill with OEM-spec synthetic ATF, road test to verify shift quality.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 2.0,
    skillLevel: "B",
  },
  {
    id: "lg-012",
    jobCode: "DT-CLU-ADJ-012",
    category: "Transmission",
    description: "Clutch adjustment",
    detail:
      "Adjust clutch free-play to OEM spec (1/2 in. typical), lube release bearing fitting, verify clutch brake squeeze.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International"],
    laborHours: 1.0,
    skillLevel: "B",
  },
  {
    id: "lg-013",
    jobCode: "DT-UJT-013",
    category: "Transmission",
    description: "Replace driveline U-joint",
    detail:
      "R&R single driveshaft U-joint, balance check, grease all zerks, road test for vibration.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.5,
    skillLevel: "B",
  },

  // ── Electrical (3) ──────────────────────────────────────────────────────
  {
    id: "lg-014",
    jobCode: "EL-BAT-014",
    category: "Electrical",
    description: "Replace batteries (set) and load test",
    detail:
      "R&R battery bank (typically 3–4 Group 31 AGM), clean terminals, apply protectant, perform load test and parasitic-draw check.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.2,
    skillLevel: "C",
  },
  {
    id: "lg-015",
    jobCode: "EL-HRN-DIAG-015",
    category: "Electrical",
    description: "Diagnose wiring harness fault",
    detail:
      "Trace electrical fault using DVOM and wiring diagram, identify open/short/high-resistance, document repair plan.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 2.5,
    skillLevel: "A",
    notes: "Hourly diag — actual repair time billed separately.",
  },
  {
    id: "lg-016",
    jobCode: "EL-HLP-016",
    category: "Electrical",
    description: "Replace headlamp assembly",
    detail:
      "R&R single headlamp assembly, aim adjustment, function-check high/low beam and DRL.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 0.8,
    skillLevel: "C",
  },

  // ── HVAC (2) ────────────────────────────────────────────────────────────
  {
    id: "lg-017",
    jobCode: "HV-AC-RCHG-017",
    category: "HVAC",
    description: "A/C system recharge and leak check",
    detail:
      "Recover refrigerant, vacuum system, leak-check with UV dye, recharge to OEM spec R-134a or R-1234yf, verify vent temp.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.5,
    skillLevel: "B",
  },
  {
    id: "lg-018",
    jobCode: "HV-BLW-018",
    category: "HVAC",
    description: "Replace HVAC blower motor",
    detail:
      "R&R cab blower motor and squirrel cage, check resistor pack, verify all fan speeds.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 1.8,
    skillLevel: "B",
  },

  // ── Suspension (3) ──────────────────────────────────────────────────────
  {
    id: "lg-019",
    jobCode: "SUS-AB-019",
    category: "Suspension",
    description: "Replace air bag (suspension)",
    detail:
      "R&R single rear suspension air bag, leak-check, verify ride height and dump-valve operation.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 1.5,
    skillLevel: "B",
  },
  {
    id: "lg-020",
    jobCode: "SUS-LFS-020",
    category: "Suspension",
    description: "Leaf spring inspection and bushing service",
    detail:
      "Inspect leaf-spring stack for cracked/broken leaves, R&R worn bushings, torque U-bolts to spec, lube all fittings.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 2.0,
    skillLevel: "B",
  },
  {
    id: "lg-021",
    jobCode: "SUS-ALN-3AX-021",
    category: "Suspension",
    description: "3-axle alignment",
    detail:
      "Full 3-axle (steer + tandem drive) alignment on heavy-duty rack. Caster, camber, toe, thrust angle, axle parallelism.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 2.5,
    skillLevel: "A",
  },

  // ── Aftertreatment (4) ──────────────────────────────────────────────────
  {
    id: "lg-022",
    jobCode: "AT-DPF-CLN-022",
    category: "Aftertreatment",
    description: "DPF removal, clean, and reinstall",
    detail:
      "R&R diesel particulate filter, off-vehicle bake/blow cleaning, gasket replacement, post-install regen and ash-level reset.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 3.5,
    skillLevel: "A",
    notes: "Add 0.5 hr if V-band clamps are seized.",
  },
  {
    id: "lg-023",
    jobCode: "AT-DEF-TNK-023",
    category: "Aftertreatment",
    description: "Replace DEF tank",
    detail:
      "R&R DEF tank, transfer level sensor and heater element, prime supply lines, code clear and relearn DEF quality.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 3.0,
    skillLevel: "B",
  },
  {
    id: "lg-024",
    jobCode: "AT-EGR-COL-024",
    category: "Aftertreatment",
    description: "Replace EGR cooler",
    detail:
      "R&R EGR cooler, replace gaskets and V-band clamps, pressure test, verify no coolant intrusion to intake.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 6.5,
    skillLevel: "A",
  },
  {
    id: "lg-025",
    jobCode: "AT-REGEN-025",
    category: "Aftertreatment",
    description: "Perform forced (parked) regen",
    detail:
      "Initiate and supervise forced regeneration via service tool. Includes soot level pre/post check and fault clear.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 1.0,
    skillLevel: "C",
  },

  // ── Diagnostics (3) ─────────────────────────────────────────────────────
  {
    id: "lg-026",
    jobCode: "DG-J1939-026",
    category: "Diagnostics",
    description: "J1939 scan and code-clear report",
    detail:
      "Full vehicle scan across all J1939/J1708 ECMs, document active and historic codes, produce customer-facing report.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo"],
    laborHours: 1.0,
    skillLevel: "B",
  },
  {
    id: "lg-027",
    jobCode: "DG-NS-027",
    category: "Diagnostics",
    description: "No-start diagnosis",
    detail:
      "Systematic no-start diagnosis — batteries, starter draw, fuel pressure, ECM communication, crank/cam sensor signal.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 2.0,
    skillLevel: "A",
  },
  {
    id: "lg-028",
    jobCode: "DG-MIL-028",
    category: "Diagnostics",
    description: "MIL (check engine) diagnosis",
    detail:
      "Diagnose active MIL — fault tree per code, sensor live-data review, root-cause documentation.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.5,
    skillLevel: "B",
  },

  // ── Maintenance (2) ─────────────────────────────────────────────────────
  {
    id: "lg-029",
    jobCode: "PM-A-029",
    category: "Maintenance",
    description: "PM service A (lube, oil, filter)",
    detail:
      "Standard A-service: engine oil + filter, chassis lube, fluid top-off, brake-stroke check, lights/tires/horn inspection.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 1.5,
    skillLevel: "C",
  },
  {
    id: "lg-030",
    jobCode: "PM-B-030",
    category: "Maintenance",
    description: "PM service B (A + filters + DVIR)",
    detail:
      "Full B-service: A-service plus fuel-water sep, air filter, cabin filter, full 50-point DVIR with photos.",
    applicableMakes: ["Freightliner", "Peterbilt", "Kenworth", "International", "Volvo", "Ford SD"],
    laborHours: 3.0,
    skillLevel: "B",
  },
];
