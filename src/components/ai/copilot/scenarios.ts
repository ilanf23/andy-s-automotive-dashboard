import type { Scenario, ScenarioStep } from "./types";

// ============================================================================
// Scripted scenarios — hand-crafted demo paths
// Each scenario matches on user input keywords and runs a sequence of steps.
// ============================================================================

// ----------------------------------------------------------------------------
// 1) Build estimate from inspection findings + send to fleet
// ----------------------------------------------------------------------------

const BUILD_AND_SEND_ESTIMATE: Scenario = {
  name: "build-and-send-estimate",
  match: (q) =>
    (q.includes("estimate") || q.includes("quote")) &&
    (q.includes("mt-47") ||
      q.includes("med trust") ||
      q.includes("4847") ||
      q.includes("brake")),
  context: {
    type: "ro",
    id: "4847",
    label: "RO #4847 — Med Trust MT-47",
    sub: "2019 Ford E-450 Ambulance · Awaiting Approval",
    fields: [
      { label: "Customer", value: "Med Trust (Fleet)" },
      { label: "Vehicle", value: "Med Trust Unit 47" },
      { label: "Days in shop", value: "3" },
      { label: "Findings", value: "2 red · 3 yellow · 28 green" },
      { label: "Current estimate", value: "$348 (1 line)" },
    ],
  },
  steps: [
    {
      type: "text",
      text: "Let me pull RO 4847 and check what's missing on the estimate.",
    },
    {
      type: "tool",
      tool: "read_repair_order",
      args: { roId: "4847" },
      result:
        "RO 4847 · Med Trust MT-47 · Awaiting Approval · 3 days in shop · 5 inspection findings (1 estimated, 4 unestimated)",
    },
    {
      type: "tool",
      tool: "read_inspection",
      args: { roId: "4847" },
      result:
        "INS-4847 · 37-point DVI · 2 red, 3 yellow, 28 green · 5 inspection photos · Completed by Marcus on May 18",
    },
    {
      type: "reasoning",
      intro: "Analyzing the gap and pulling supporting data:",
      steps: [
        "Identified 4 unestimated findings (front brakes, marker light, cabin filter, ABS sensor)",
        "Cross-referencing your shop's 47 brake jobs on Class 5-6 ambulances",
        "Pulling live parts pricing from Worldpac + OEM Ford",
        "Computing labor times — Mitchell1 + your shop history",
        "Applying Med Trust's negotiated fleet rate ($138/hr vs $148 default)",
      ],
    },
    {
      type: "tool",
      tool: "build_estimate_lines",
      args: { roId: "4847", source: "inspection" },
      result: "Generated 4 lines · $1,213 subtotal · confidence: 3 HIGH, 1 MEDIUM",
      durationMs: 1100,
    },
    { type: "text", text: "Here's what I propose to add to the estimate:" },
    {
      type: "result",
      card: {
        title: "Proposed estimate lines · RO 4847",
        rows: [
          {
            label: "Front brake job (pads + rotor turn)",
            value: "$690.00",
            sub: "Wagner OEX HD · 4.0 hrs · 95% confidence",
          },
          {
            label: "Driver-rear marker light (LED)",
            value: "$86.90",
            sub: "Whelen Vertex · 0.3 hrs · 92% confidence",
          },
          {
            label: "Cabin air filter replacement",
            value: "$72.40",
            sub: "Motorcraft FP-66 · 0.3 hrs · 98% confidence",
          },
          {
            label: "Rear ABS wheel sensor (LH)",
            value: "$333.00",
            sub: "Motorcraft ALS-2245 · 1.0 hrs · 78% confidence",
          },
        ],
        footer: "Subtotal $1,182.30 · Tax $30.70 · Total $1,213.00",
      },
    },
    {
      type: "approval",
      preview: {
        title: "Add 4 lines to estimate + send to Med Trust?",
        description:
          "I'll apply the lines, update RO 4847's total, then submit the estimate to Med Trust via Fleetio for fleet manager approval.",
        details: [
          { label: "Total added", value: "+$1,213.00" },
          { label: "Routing", value: "Fleetio · auto-approval flow" },
          { label: "Recipient", value: "Dana Whitfield (fleet mgr)" },
          { label: "Expected approval", value: "Within 4 hours" },
        ],
        impact: "$1,213 added to RO + estimate routed for approval",
        tone: "success",
      },
      onApproved: [
        {
          type: "tool",
          tool: "apply_estimate_lines",
          args: { roId: "4847", lines: 4 },
          result: "4 lines applied · RO total updated $1,850 → $3,063",
          durationMs: 600,
        },
        {
          type: "tool",
          tool: "send_to_fleet_platform",
          args: { estimateId: "EST-4847", platform: "Fleetio" },
          result: "Submitted · Fleetio tracking ID FLT-92301 · awaiting Dana's approval",
          durationMs: 900,
        },
        {
          type: "text",
          text: "Done. Med Trust will see it in Fleetio within 60 seconds. I'm watching for the approval — I'll notify you the moment Dana clicks Approve, or escalate to you if she pushes back on any line.",
        },
        {
          type: "suggestions",
          prompts: [
            "Schedule Andre to start work tomorrow morning",
            "What's the GP on this RO after my changes?",
            "Send Dana a heads-up SMS that the estimate is in her inbox",
          ],
        },
      ],
      onRejected: [
        {
          type: "text",
          text: "No problem — I'll discard the proposal. Want me to suggest a different mix of lines, or open the AI Estimate Builder so you can edit before sending?",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 2) Top customers by LTV
// ----------------------------------------------------------------------------

const TOP_CUSTOMERS: Scenario = {
  name: "top-customers",
  match: (q) =>
    (q.includes("top") || q.includes("biggest") || q.includes("best")) &&
    q.includes("customer"),
  steps: [
    { type: "text", text: "Pulling lifetime value across your customer base..." },
    {
      type: "tool",
      tool: "query_customers",
      args: { sortBy: "lifetimeValue", direction: "desc", limit: 5 },
      result: "5 customers returned",
      durationMs: 500,
    },
    {
      type: "result",
      card: {
        title: "Top 5 by lifetime value",
        rows: [
          { label: "1. Med Trust", value: "$1.05M", sub: "Fleet · 12 vehicles · Champion", tone: "success" },
          { label: "2. City Form", value: "$1.02M", sub: "Fleet · 8 vehicles · Champion", tone: "success" },
          { label: "3. Reliable Ducks", value: "$482k", sub: "Fleet · 4 vehicles · Declining", tone: "warning" },
          { label: "4. First Coast Supplies", value: "$318k", sub: "Fleet · 6 vehicles · Declining", tone: "warning" },
          { label: "5. Davy Tree Service", value: "$277k", sub: "Fleet · 5 vehicles · Growing" },
        ],
        footer: "Top 5 = 92% of LTV across your book. Two of them are trending down.",
      },
    },
    {
      type: "text",
      text: "Two of these are flagged Declining by my health-score model. Want me to draft outreach for Reliable Ducks and First Coast? They've each cooled in the last 60 days.",
    },
    {
      type: "suggestions",
      prompts: [
        "Draft a check-in SMS to Reliable Ducks",
        "Why is First Coast Supplies declining?",
        "Show me Med Trust's spend trend month-over-month",
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 3) Real labor GP (Tekmetric's broken report)
// ----------------------------------------------------------------------------

const LABOR_GP: Scenario = {
  name: "labor-gp",
  match: (q) =>
    q.includes("labor") &&
    (q.includes("gp") || q.includes("margin") || q.includes("profit") || q.includes("real")),
  steps: [
    {
      type: "text",
      text: "Computing labor GP using your actual hourly pay (not the flat-rate assumption Tekmetric uses)...",
    },
    {
      type: "tool",
      tool: "query_timeclock",
      args: { period: "this_week" },
      result: "5 techs · 168 hours clocked · $10,330 wages",
    },
    {
      type: "tool",
      tool: "query_labor_sales",
      args: { period: "this_week" },
      result: "$24,830 in labor sales across 23 ROs",
    },
    {
      type: "tool",
      tool: "compute_labor_gp",
      args: { method: "actual_hourly" },
      result: "GP = 58.4% (Tekmetric reports 82.6% on flat-rate basis)",
    },
    {
      type: "result",
      card: {
        title: "Labor GP — this week (real hourly basis)",
        rows: [
          { label: "Labor sales", value: "$24,830" },
          { label: "Tech wages paid (actual)", value: "$10,330" },
          { label: "Gross profit", value: "$14,500", tone: "success" },
          { label: "GP %", value: "58.4%", sub: "+1.2 pts vs last week", tone: "success" },
          { label: "Tekmetric's report", value: "82.6%", sub: "Inflated — uses flat-rate", tone: "warning" },
        ],
        footer: "Formula: (Labor sales − wages paid) ÷ Labor sales = 14,500 ÷ 24,830 = 58.4%",
      },
    },
    {
      type: "text",
      text: "Trevor is dragging the average — he's at 47% efficiency this week (18hrs over estimate on the Bayside Marine job). Want me to flag that for review?",
    },
    {
      type: "suggestions",
      prompts: [
        "Show me efficiency by tech",
        "What's driving Trevor's slow week?",
        "Compare this to last month's labor GP",
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 4) Schedule appointment
// ----------------------------------------------------------------------------

const SCHEDULE_APPOINTMENT: Scenario = {
  name: "schedule-appointment",
  match: (q) =>
    (q.includes("schedule") || q.includes("book") || q.includes("appointment")) &&
    (q.includes("ducks") || q.includes("tuesday") || q.includes("reliable")),
  context: {
    type: "customer",
    id: "CUST-DUCKS",
    label: "Reliable Ducks",
    sub: "Fleet · 4 vehicles · 5 weeks since last visit",
    fields: [
      { label: "Contact", value: "Wes Carmichael" },
      { label: "Phone", value: "(904) 555-0331" },
      { label: "Platform", value: "Enterprise Fleet" },
      { label: "Health", value: "Declining (52)" },
    ],
  },
  steps: [
    { type: "text", text: "Finding an open slot for Reliable Ducks..." },
    {
      type: "tool",
      tool: "read_customer",
      args: { name: "Reliable Ducks" },
      result: "CUST-DUCKS · 4 vehicles on file · last visit 35 days ago · normal cadence 14 days",
    },
    {
      type: "tool",
      tool: "read_vehicles",
      args: { customerId: "CUST-DUCKS" },
      result: "RD-08 (Freightliner M2 jetter) · RD-12 (Peterbilt 337 jetter) · RD-15 · RD-18",
    },
    {
      type: "text",
      text: "They have 4 trucks on file. Wes usually rotates them by idle hours — RD-12 is overdue by ~600 hrs. I'll plan around that one. Checking bay availability...",
    },
    {
      type: "tool",
      tool: "query_bay_availability",
      args: { date: "2026-05-26", duration: "3hrs" },
      result: "Bay 2 open 10:00 AM – 1:00 PM · Bay 3 open 8:00 AM – 11:00 AM",
    },
    {
      type: "tool",
      tool: "query_tech_availability",
      args: { date: "2026-05-26", specialty: "diesel" },
      result: "Marcus (diesel specialist) · 8 hr capacity · 2 conflicting jobs on tracker",
    },
    {
      type: "reasoning",
      steps: [
        "RD-12 is jetter — diesel + hydraulic work, Marcus is the right tech",
        "Bay 2 has the lift Marcus prefers + room for the cone holder",
        "10am gives Wes time to deliver after his morning route",
        "Adding 15 min buffer for VIN check-in",
      ],
    },
    {
      type: "approval",
      preview: {
        title: "Book RD-12 for Tuesday, May 26 at 10:00 AM?",
        description:
          "Idle-hours service (oil + 6-filter swap) on RD-12 jetter. Marcus will lead, Bay 2. SMS confirmation goes to Wes immediately.",
        details: [
          { label: "Customer", value: "Reliable Ducks (Wes Carmichael)" },
          { label: "Vehicle", value: "RD-12 · 2020 Peterbilt 337 · 8,420 idle hrs" },
          { label: "Service", value: "Idle-hour service (multi-filter diesel)" },
          { label: "Tech", value: "Marcus Reeves" },
          { label: "Bay", value: "Bay 2 · Heavy" },
          { label: "Duration", value: "3 hours" },
          { label: "Notify customer", value: "SMS to (904) 555-0331" },
        ],
        impact: "Books a $1,200 service · re-engages a Declining customer",
      },
      onApproved: [
        {
          type: "tool",
          tool: "create_appointment",
          args: {
            customerId: "CUST-DUCKS",
            vehicleId: "VEH-RD12",
            techId: "TECH-MARCUS",
            bay: 2,
            startISO: "2026-05-26T10:00:00",
          },
          result: "AP-9847 created · added to schedule",
          durationMs: 600,
        },
        {
          type: "tool",
          tool: "send_confirmation_sms",
          args: { phone: "(904) 555-0331" },
          result: "SMS delivered · Wes replied OK ✓",
          durationMs: 700,
        },
        {
          type: "text",
          text: "Booked + confirmed. Wes already replied OK. I'll also reach out 24 hours before with the standard pre-arrival reminder. Want me to draft a small re-engagement note since they've cooled lately?",
        },
        {
          type: "suggestions",
          prompts: [
            "Draft a re-engagement note for Wes",
            "What service did we do last time for RD-12?",
            "Book RD-08 for the same week",
          ],
        },
      ],
      onRejected: [
        {
          type: "text",
          text: "Got it — not booking. Want a different time slot, or a different tech?",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 5) Investigate stuck RO
// ----------------------------------------------------------------------------

const STUCK_RO: Scenario = {
  name: "stuck-ro",
  match: (q) =>
    (q.includes("why") || q.includes("stuck") || q.includes("status")) &&
    (q.includes("4847") || q.includes("mt-47") || q.includes("med trust")),
  context: {
    type: "ro",
    id: "4847",
    label: "RO #4847 — Med Trust MT-47",
    sub: "Awaiting Approval · 3 days in shop",
  },
  steps: [
    { type: "text", text: "Let me trace what's blocking RO 4847..." },
    {
      type: "tool",
      tool: "read_repair_order",
      args: { roId: "4847" },
      result: "Status: Awaiting Approval · Opened May 17 · 3 days · Total $1,850",
    },
    {
      type: "tool",
      tool: "read_inspection",
      args: { roId: "4847" },
      result: "Inspection complete · 5 findings (2 red, 3 yellow)",
    },
    {
      type: "tool",
      tool: "read_estimate",
      args: { roId: "4847" },
      result: "EST-4847 · 1 line item ($348) · sent to Fleetio",
    },
    {
      type: "tool",
      tool: "read_messages",
      args: { context: "RO-4847" },
      result:
        "Last from Dana: 'reviewing with fleet manager — back to you by EOD' (3 days ago, no reply since)",
    },
    {
      type: "reasoning",
      intro: "Diagnosing:",
      steps: [
        "Estimate covers only 1 of 5 inspection findings",
        "Dana told fleet manager 'back to you by EOD' — implies she sent on, hasn't heard",
        "Fleet manager likely waiting for complete picture before signing off",
        "Lost revenue at risk: $1,213 (the 4 unestimated lines)",
      ],
    },
    {
      type: "result",
      card: {
        title: "RO 4847 diagnosis",
        rows: [
          { label: "Root cause", value: "Estimate is incomplete", tone: "warning" },
          { label: "Missing", value: "4 of 5 inspection findings unestimated" },
          { label: "Dollar gap", value: "$1,213 in unestimated work", tone: "warning" },
          { label: "Customer state", value: "Awaiting full estimate · 3 days silent", tone: "warning" },
          { label: "Fix", value: "Run AI Estimate Builder · ~30 sec" },
        ],
        footer: "Once the full estimate is in Dana's inbox, expected approval window is 4 hours based on her past behavior.",
      },
    },
    {
      type: "text",
      text: "The fix is straightforward. Want me to run the AI Estimate Builder right now to add the 4 missing lines and send the corrected estimate?",
    },
    {
      type: "suggestions",
      prompts: [
        "Yes — build the estimate and send it",
        "Why didn't Marcus add those lines originally?",
        "What's Dana's typical approval turnaround?",
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 6) Demand letter for Northpoint
// ----------------------------------------------------------------------------

const DEMAND_LETTER: Scenario = {
  name: "demand-letter",
  match: (q) =>
    (q.includes("demand") || q.includes("lien") || q.includes("collect")) &&
    (q.includes("northpoint") || q.includes("17") || q.includes("past due")),
  context: {
    type: "customer",
    id: "CUST-NORTHPOINT",
    label: "Northpoint Logistics",
    sub: "$17,000 · 185 days past due",
    fields: [
      { label: "Contact", value: "Vince Marek" },
      { label: "Health", value: "At Risk (18)" },
      { label: "Last reply", value: "Feb 13 — 'truck not running'" },
    ],
  },
  steps: [
    { type: "text", text: "Pulling Northpoint's full AR + dunning history..." },
    {
      type: "tool",
      tool: "read_ar",
      args: { customerId: "CUST-NORTHPOINT" },
      result: "$17,000 owed · 185 days past due · 6 dunning steps completed · $500 partial payment Feb 14",
    },
    {
      type: "tool",
      tool: "read_messages",
      args: { customerId: "CUST-NORTHPOINT" },
      result: "9 messages · last reply Feb 13 from Vince: 'crew let go, truck not generating revenue, will pay when running'",
    },
    {
      type: "tool",
      tool: "read_invoice",
      args: { invoiceId: "INV-4831" },
      result: "Original invoice $17,000 · service: full transmission rebuild + 12 inspection findings · Dec 1, 2025",
    },
    {
      type: "reasoning",
      steps: [
        "All standard dunning steps exhausted (SMS, email, voice calls, demand letter)",
        "Customer has not made a payment since Feb 14 ($500)",
        "Truck is still in their possession (not in our shop)",
        "Florida mechanic's lien is enforceable up to 1 year after work",
        "Drafting formal lien notice — final step before filing",
      ],
    },
    {
      type: "tool",
      tool: "draft_lien_notice",
      args: { customerId: "CUST-NORTHPOINT", amount: 17000 },
      result: "Drafted · 2 pages · references service records, signed estimate, 6 prior dunning attempts",
    },
    {
      type: "approval",
      preview: {
        title: "Send formal lien notice to Northpoint Logistics?",
        description:
          "This is the final step before filing a Florida mechanic's lien on Northpoint's vehicle (truck VIN on file). The notice gives them 30 days to pay or set up a payment plan; if no response, the lien auto-files on day 31 and we own the truck title pending sale.",
        details: [
          { label: "Amount owed", value: "$17,000.00", mono: true },
          { label: "Recipient", value: "Vince Marek · certified mail + email" },
          { label: "Auto-file lien on", value: "Jun 22, 2026 (30 days)" },
          { label: "Filing fee", value: "$42.00 (FL state)" },
          { label: "Estimated recovery", value: "$15,800 net after fees" },
        ],
        impact: "Triggers final 30-day clock before lien filing",
        tone: "danger",
        body: `FINAL NOTICE — MECHANIC'S LIEN PENDING

Northpoint Logistics, Inc.
Attn: Vince Marek
2240 Imeson Rd
Jacksonville, FL 32220

Re: Invoice INV-4831 · Past due 185 days · Amount $17,000.00

Andy's Automotive has provided you six prior notices regarding the outstanding balance of $17,000.00 for service rendered December 1, 2025 (transmission rebuild and associated repairs on your commercial vehicle). The last received payment was a partial payment of $500.00 on February 14, 2026.

In accordance with Florida Statute § 713.585, this letter serves as the FINAL NOTICE before we file a mechanic's lien against the vehicle in question. You have THIRTY (30) DAYS from receipt of this notice to either: (1) pay the balance in full; (2) enter into a written payment plan with our office; or (3) provide written dispute of the charges.

Failure to act within 30 days will result in the lien being filed with the Duval County Clerk of Court, and Andy's Automotive will pursue collection through sale of the vehicle as permitted by law.

We have made every reasonable effort to work with you. This is your final opportunity to resolve this matter without legal action.

Sincerely,
Andy Mills · Owner
Andy's Automotive, LLC`,
      },
      onApproved: [
        {
          type: "tool",
          tool: "send_certified_mail",
          args: { recipient: "Northpoint Logistics" },
          result: "USPS certified mail dispatched · tracking 9405...",
          durationMs: 800,
        },
        {
          type: "tool",
          tool: "send_email",
          args: { recipient: "vmarek@northpointlogistics.com" },
          result: "Email delivered · read receipt requested",
          durationMs: 500,
        },
        {
          type: "tool",
          tool: "schedule_lien_filing",
          args: { daysFromNow: 30 },
          result: "Auto-filing queued for Jun 22, 2026 · revocable until that date",
          durationMs: 400,
        },
        {
          type: "text",
          text: "Sent both ways. Lien filing is queued for June 22 — I'll pause the auto-file the moment Vince responds or pays. I'll also alert you 7 days before the file date as a final reminder. This is locked behind your approval too; I won't auto-file without you saying go.",
        },
        {
          type: "suggestions",
          prompts: [
            "Set up a payment plan template for if Vince calls",
            "What's the lien filing process in Duval County?",
            "Show me other accounts at risk of going this far",
          ],
        },
      ],
      onRejected: [
        {
          type: "text",
          text: "Holding off. Want me to make a softer attempt first — a final personal call from you, or a payment-plan offer?",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 7) Greeting / What can you do
// ----------------------------------------------------------------------------

const GREETING: Scenario = {
  name: "greeting",
  match: (q) =>
    q === "" ||
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.includes("what can you do") ||
    q.includes("help me") ||
    q.includes("what are you"),
  steps: [
    {
      type: "text",
      text: "I'm your shop's AI copilot — I have access to every RO, customer, vehicle, estimate, inspection, part, message, and report in the platform. I can answer questions, run analytics, and take actions on your behalf.",
    },
    {
      type: "text",
      text: "When I take an action that touches money, contracts, or customer-facing communication, I'll pause and ask for your approval — you'll see exactly what I'm about to do before I do it.",
    },
    {
      type: "suggestions",
      prompts: [
        "Give me an estimate for the brake job on MT-47 and send it to Med Trust",
        "Show me my top 5 customers by lifetime value",
        "What's my real labor GP this week using hourly pay?",
        "Schedule Reliable Ducks for next Tuesday at 10am",
        "Why is RO 4847 stuck?",
        "Send Northpoint a demand letter for the $17k past due",
        "Find me parts for the front brake job on MT-47",
        "What's at risk of churning this month?",
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 8) Churn / at-risk customers
// ----------------------------------------------------------------------------

const CHURN_RISK: Scenario = {
  name: "churn-risk",
  match: (q) =>
    q.includes("churn") || q.includes("at risk") || q.includes("losing") || q.includes("declining"),
  steps: [
    { type: "text", text: "Scanning your customer base for churn signals..." },
    {
      type: "tool",
      tool: "compute_health_scores",
      args: { period: "rolling_90d" },
      result: "3 customers flagged: Reliable Ducks (52), First Coast (58), Northpoint (18 — already churned)",
      durationMs: 900,
    },
    {
      type: "result",
      card: {
        title: "Customers trending the wrong way",
        rows: [
          {
            label: "Reliable Ducks",
            value: "Score 52 · Declining",
            sub: "Last visit 35d ago · normal cadence 14d · Enterprise opened 2 competitor estimates",
            tone: "warning",
          },
          {
            label: "First Coast Supplies",
            value: "Score 58 · Declining",
            sub: "Estimate approval 92% → 64% · ARO dropped $1,840 → $980",
            tone: "warning",
          },
          {
            label: "Northpoint Logistics",
            value: "Score 18 · At Risk",
            sub: "$17k 185 days past due · effectively churned",
            tone: "danger",
          },
        ],
        footer: "Three concrete actions below — I can run all three.",
      },
    },
    {
      type: "approval",
      preview: {
        title: "Run all 3 outreach actions now?",
        description:
          "I'll send a personalized check-in to each, with the right tone for their health score.",
        details: [
          { label: "Reliable Ducks", value: "Personal SMS from Cameron + book-now link" },
          { label: "First Coast", value: "Email offering bundled-package pricing" },
          { label: "Northpoint", value: "Skip — already in dunning flow" },
        ],
        impact: "Targets ~$24k recoverable annual revenue",
        tone: "success",
      },
      onApproved: [
        {
          type: "tool",
          tool: "send_sms",
          args: { customerId: "CUST-DUCKS" },
          result: "SMS sent to Wes Carmichael · delivered",
          durationMs: 500,
        },
        {
          type: "tool",
          tool: "send_email",
          args: { customerId: "CUST-FCS" },
          result: "Email sent to Lori Banks · opened within 2 min",
          durationMs: 700,
        },
        {
          type: "text",
          text: "Done. Lori already opened the email — I'll watch for replies and surface them in your morning briefing.",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 9) Parts identification
// ----------------------------------------------------------------------------

const PARTS_LOOKUP: Scenario = {
  name: "parts-lookup",
  match: (q) =>
    (q.includes("part") || q.includes("filter")) &&
    (q.includes("find") || q.includes("which") || q.includes("identify") || q.includes("lookup")),
  steps: [
    { type: "text", text: "Pulling parts for the front brake job on MT-47..." },
    {
      type: "tool",
      tool: "read_vehicle",
      args: { vehicleId: "VEH-MT47" },
      result: "2019 Ford E-450 Ambulance · 184k miles · Class 5 duty",
    },
    {
      type: "tool",
      tool: "query_parts",
      args: { vehicleId: "VEH-MT47", job: "front_brake_pads_and_rotors" },
      result: "12 candidate SKUs across Worldpac/NAPA/OEM · narrowing by duty class + your shop's history",
      durationMs: 700,
    },
    {
      type: "tool",
      tool: "filter_by_shop_history",
      args: { vehicleClass: "ambulance_e450" },
      result: "Wagner OEX HD ceramic pads — your shop has used these 11 of last 12 times",
    },
    {
      type: "result",
      card: {
        title: "Recommended parts · MT-47 front brake job",
        rows: [
          {
            label: "Front brake pads (HD ceramic)",
            value: "Wagner OEX MX1639 · $98.40",
            sub: "Worldpac · 6 in stock at Jax hub · 1.5h ETA",
            tone: "success",
          },
          {
            label: "Rotor (front, drilled & slotted)",
            value: "Pronto DR-F4509 · $72.00 ea",
            sub: "NAPA · 4 in stock at Phillips Hwy · 30 min ETA",
            tone: "success",
          },
          {
            label: "Brake hardware kit",
            value: "Carlson H5829 · $18.40",
            sub: "OEM · in your inventory now",
          },
          {
            label: "Brake fluid (DOT 4, 32oz)",
            value: "Motorcraft PM-20 · $14.00",
            sub: "OEM · in your inventory now",
          },
        ],
        footer: "Total parts cost: $185.40 · Resells at $382 on your standard markup matrix",
      },
    },
    {
      type: "text",
      text: "All in-network. Want me to place the order with Worldpac for the pads now? They close at 6pm — order before 5pm hits tomorrow morning.",
    },
    {
      type: "suggestions",
      prompts: [
        "Order the Wagner pads from Worldpac",
        "What's the cheaper alternative on the pads?",
        "Check NAPA's price on the same Wagner SKU",
      ],
    },
  ],
};

// ============================================================================
// Fallback — no scenario matched
// ============================================================================

export const FALLBACK_STEPS: ScenarioStep[] = [
  {
    type: "text",
    text: "I don't have a scripted answer for that yet, but in production I'd answer it from your shop's full data with live tool access. Try one of these to see how the agentic flow works:",
  },
  {
    type: "suggestions",
    prompts: [
      "Give me an estimate for the brake job on MT-47 and send it to Med Trust",
      "Show me my top 5 customers by lifetime value",
      "What's my real labor GP this week using hourly pay?",
      "Schedule Reliable Ducks for next Tuesday at 10am",
      "Why is RO 4847 stuck?",
      "Send Northpoint a demand letter for the $17k past due",
      "Find me parts for the front brake job on MT-47",
      "What's at risk of churning this month?",
    ],
  },
];

// ============================================================================
// All scenarios in match-priority order
// ============================================================================

export const SCENARIOS: Scenario[] = [
  GREETING,
  BUILD_AND_SEND_ESTIMATE,
  TOP_CUSTOMERS,
  LABOR_GP,
  SCHEDULE_APPOINTMENT,
  STUCK_RO,
  DEMAND_LETTER,
  CHURN_RISK,
  PARTS_LOOKUP,
];

export function matchScenario(input: string): Scenario | null {
  const q = input.toLowerCase().trim();
  for (const s of SCENARIOS) {
    if (s.match(q)) return s;
  }
  return null;
}
