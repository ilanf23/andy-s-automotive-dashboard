import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Wrench,
  ClipboardCheck,
  Sparkles,
  AlertTriangle,
  Calendar,
  Truck,
  Filter,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import clsx from "clsx";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/PageShell";
import { technicians } from "@/data/technicians";

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
});

type Category = "service" | "inspection" | "ai-estimated" | "drop-off" | "pickup";
type ShopStatus =
  | "in-progress"
  | "awaiting-approval"
  | "estimate-building"
  | "ai-estimated"
  | "inspection"
  | "ready"
  | "completed"
  | "just-arrived";

type Appointment = {
  id: string;
  techId: string;
  dayIdx: number; // 0..5
  unit: string;
  customer: string;
  ro: string;
  startHour: number; // 24h
  durationHrs: number;
  bay: 1 | 2 | 3 | 4 | 5;
  category: Category;
  status: ShopStatus;
};

const categoryStripe: Record<Category, string> = {
  service: "border-l-foreground",
  inspection: "border-l-[#3730A3]",
  "ai-estimated": "border-l-accent",
  "drop-off": "border-l-success",
  pickup: "border-l-[#16A34A]",
};

const categoryLabel: Record<Category, string> = {
  service: "Service",
  inspection: "Inspection",
  "ai-estimated": "AI-Estimated",
  "drop-off": "Drop-off",
  pickup: "Pickup",
};

const statusBadge: Record<string, string> = {
  "in-progress": "bg-[#E0E7FF] text-[#3730A3]",
  "awaiting-approval": "bg-accent/30 text-[#991B1B]",
  "estimate-building": "bg-[#DBEAFE] text-[#1E40AF]",
  "ai-estimated": "bg-accent/30 text-[#991B1B]",
  inspection: "bg-[#FEF3C7] text-[#92400E]",
  ready: "bg-success/15 text-success",
  completed: "bg-foreground text-background",
  "just-arrived": "bg-surface text-foreground",
};

const TECH_IDS = ["TECH-MARCUS", "TECH-JOSE", "TECH-ANDRE", "TECH-TREVOR", "TECH-DANNY"];

const APPOINTMENTS: Appointment[] = [
  // Wed (today, dayIdx=2)
  { id: "A1", techId: "TECH-MARCUS", dayIdx: 2, unit: "MT-47", customer: "Med Trust", ro: "4847", startHour: 8, durationHrs: 4, bay: 2, category: "service", status: "awaiting-approval" },
  { id: "A2", techId: "TECH-MARCUS", dayIdx: 2, unit: "CF-221", customer: "City Form", ro: "4842", startHour: 13, durationHrs: 4, bay: 2, category: "service", status: "ready" },
  { id: "A3", techId: "TECH-JOSE", dayIdx: 2, unit: "FCS-118", customer: "First Coast", ro: "4845", startHour: 8, durationHrs: 4, bay: 1, category: "service", status: "awaiting-approval" },
  { id: "A4", techId: "TECH-JOSE", dayIdx: 2, unit: "DT-7", customer: "Davy Tree", ro: "4860", startHour: 13, durationHrs: 4, bay: 1, category: "service", status: "in-progress" },
  { id: "A5", techId: "TECH-ANDRE", dayIdx: 2, unit: "MT-52", customer: "Med Trust", ro: "4852", startHour: 13, durationHrs: 4, bay: 3, category: "inspection", status: "inspection" },
  { id: "A6", techId: "TECH-ANDRE", dayIdx: 2, unit: "MT-47", customer: "Med Trust", ro: "4847", startHour: 8, durationHrs: 4, bay: 3, category: "service", status: "awaiting-approval" },
  { id: "A7", techId: "TECH-TREVOR", dayIdx: 2, unit: "BAY-01", customer: "Bayside Marine", ro: "4844", startHour: 8, durationHrs: 3, bay: 4, category: "service", status: "in-progress" },
  { id: "A8", techId: "TECH-TREVOR", dayIdx: 2, unit: "ATL-01", customer: "Atlantic Pools", ro: "4843", startHour: 11, durationHrs: 2, bay: 4, category: "service", status: "in-progress" },
  { id: "A9", techId: "TECH-DANNY", dayIdx: 2, unit: "Hollis · RAV4", customer: "Sarah Hollis", ro: "4856", startHour: 9, durationHrs: 1, bay: 5, category: "service", status: "just-arrived" },
  { id: "A10", techId: "TECH-DANNY", dayIdx: 2, unit: "Bradley · F-150", customer: "Marcus Bradley", ro: "4857", startHour: 14, durationHrs: 2, bay: 5, category: "service", status: "estimate-building" },

  // Other days (just enough for week view)
  { id: "B1", techId: "TECH-MARCUS", dayIdx: 0, unit: "MT-52", customer: "Med Trust", ro: "4852", startHour: 8, durationHrs: 4, bay: 2, category: "service", status: "in-progress" },
  { id: "B2", techId: "TECH-MARCUS", dayIdx: 0, unit: "FT-3", customer: "Form Tech", ro: "4851", startHour: 13, durationHrs: 4, bay: 2, category: "ai-estimated", status: "ai-estimated" },
  { id: "B3", techId: "TECH-MARCUS", dayIdx: 1, unit: "RD-12", customer: "Reliable Ducks", ro: "4849", startHour: 8, durationHrs: 3, bay: 2, category: "service", status: "estimate-building" },
  { id: "B4", techId: "TECH-MARCUS", dayIdx: 3, unit: "FCS-118", customer: "First Coast", ro: "4845", startHour: 8, durationHrs: 4, bay: 2, category: "service", status: "awaiting-approval" },
  { id: "B5", techId: "TECH-MARCUS", dayIdx: 4, unit: "RD-08", customer: "Reliable Ducks", ro: "4855", startHour: 8, durationHrs: 4, bay: 2, category: "service", status: "in-progress" },
  { id: "B6", techId: "TECH-JOSE", dayIdx: 0, unit: "CF-304", customer: "City Form", ro: "4848", startHour: 8, durationHrs: 4, bay: 1, category: "service", status: "in-progress" },
  { id: "B7", techId: "TECH-JOSE", dayIdx: 1, unit: "DT-7", customer: "Davy Tree", ro: "4860", startHour: 13, durationHrs: 4, bay: 1, category: "service", status: "in-progress" },
  { id: "B8", techId: "TECH-JOSE", dayIdx: 3, unit: "DT-7", customer: "Davy Tree", ro: "4860", startHour: 8, durationHrs: 4, bay: 1, category: "service", status: "in-progress" },
  { id: "B9", techId: "TECH-ANDRE", dayIdx: 0, unit: "MT-47", customer: "Med Trust", ro: "4847", startHour: 8, durationHrs: 4, bay: 3, category: "service", status: "awaiting-approval" },
  { id: "B10", techId: "TECH-TREVOR", dayIdx: 0, unit: "BAY-01", customer: "Bayside", ro: "4844", startHour: 8, durationHrs: 4, bay: 4, category: "service", status: "in-progress" },
  { id: "B11", techId: "TECH-DANNY", dayIdx: 1, unit: "O'Dell · F-150", customer: "Greg O'Dell", ro: "4858", startHour: 10, durationHrs: 1, bay: 5, category: "service", status: "completed" },
];

type UnscheduledItem = {
  id: string;
  customer: string;
  vehicle: string;
  type: string;
  note?: string;
  priority: "Standard" | "Fleet";
};

const INITIAL_UNSCHEDULED: UnscheduledItem[] = [
  { id: "u1", customer: "Nguyen — Linh", vehicle: "2020 Honda Civic", type: "Oil change", note: "Drop-off Thu AM", priority: "Standard" },
  { id: "u2", customer: "Peterson — Janelle", vehicle: "2017 Subaru Outback", type: "Diagnostic — check engine", priority: "Standard" },
  { id: "u3", customer: "FSCJ", vehicle: "FSCJ-09 · F-350", type: "DOT inspection", priority: "Fleet" },
  { id: "u4", customer: "Reyes & Sons", vehicle: "2018 Ram 2500", type: "Brake service", priority: "Standard" },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Today is 2026-05-20 (Wed). Week starts Mon 2026-05-18.
const TODAY_ISO = "2026-05-20";
const TODAY_DAY_IDX = 2;

const BAYS = [1, 2, 3, 4, 5] as const;
const BAY_LABELS = ["Bay 1 · Diesel", "Bay 2 · Heavy", "Bay 3 · Electrical", "Bay 4 · General", "Bay 5 · Retail"];
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 7am..6pm

function SchedulePage() {
  const [view, setView] = useState<"Day" | "Week" | "List">("Day");
  const [weekStart] = useState(() => startOfWeek(parseISO(TODAY_ISO), { weekStartsOn: 1 }));
  const today = parseISO(TODAY_ISO);

  // Local state — appointments and unscheduled queue (drag-and-drop mutates these)
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [unscheduled, setUnscheduled] = useState<UnscheduledItem[]>(INITIAL_UNSCHEDULED);
  const [draggingItem, setDraggingItem] = useState<UnscheduledItem | null>(null);

  const techs = useMemo(
    () => technicians.filter((t) => TECH_IDS.includes(t.id)),
    [],
  );

  const techMap = new Map(techs.map((t) => [t.id, t]));

  const weekLabel = `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 5), "MMM d, yyyy")}`;
  const dayLabel = format(today, "EEEE, MMMM d, yyyy");

  // Group today's appts by bay
  const todayApptsByBay = new Map<number, Appointment[]>();
  for (const a of appts.filter((a) => a.dayIdx === TODAY_DAY_IDX)) {
    const arr = todayApptsByBay.get(a.bay) ?? [];
    arr.push(a);
    todayApptsByBay.set(a.bay, arr);
  }

  // Group all appts by tech+day for week view
  const apptsByCell = new Map<string, Appointment[]>();
  for (const a of appts) {
    const key = `${a.techId}:${a.dayIdx}`;
    const arr = apptsByCell.get(key) ?? [];
    arr.push(a);
    apptsByCell.set(key, arr);
  }

  // Drag-and-drop handlers
  const handleScheduleDrop = (bay: number, startHour: number) => {
    if (!draggingItem) return;
    const newAppt: Appointment = {
      id: `S-${Date.now()}`,
      techId: TECH_IDS[bay % TECH_IDS.length],
      dayIdx: TODAY_DAY_IDX,
      unit: draggingItem.vehicle,
      customer: draggingItem.customer,
      ro: String(Math.floor(4860 + Math.random() * 99)),
      startHour,
      durationHrs: draggingItem.type.toLowerCase().includes("inspection") ? 1 : 2,
      bay: bay as Appointment["bay"],
      category: draggingItem.type.toLowerCase().includes("inspection")
        ? "inspection"
        : "service",
      status: "just-arrived",
    };
    setAppts((prev) => [...prev, newAppt]);
    setUnscheduled((prev) => prev.filter((u) => u.id !== draggingItem.id));
    const startLabel =
      startHour > 12 ? `${startHour - 12}p` : startHour === 12 ? "12p" : `${startHour}a`;
    toast.success("Scheduled", {
      description: `${draggingItem.customer} · ${draggingItem.vehicle} → Bay ${bay} @ ${startLabel}`,
    });
    setDraggingItem(null);
  };

  return (
    <PageShell
      title="Schedule"
      description={view === "Day" ? dayLabel : weekLabel}
      actions={
        <>
          {/* Date nav */}
          <div className="inline-flex items-center rounded-md border border-border bg-background">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-2.5 text-xs font-medium hover:text-foreground">
              Today
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* View switcher */}
          <div className="inline-flex rounded-md border border-border bg-background p-0.5">
            {(["Day", "Week", "List"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={clsx(
                  "rounded px-3 py-1 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-surface">
            <Filter className="h-3 w-3" />
            Filters
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <MiniStat label="Booked Today" value="11" icon={Calendar} />
        <MiniStat label="Open Slots" value="4" icon={Clock} accent="success" />
        <MiniStat label="Bays In Use" value="5/5" icon={Truck} accent="warning" />
        <MiniStat label="Drop-offs" value="6" icon={ArrowRight} />
        <MiniStat label="Pickups" value="3" icon={ArrowRight} />
        <MiniStat label="Confirmation Rate" value="92%" icon={User} accent="success" />
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          {view === "Day" && (
            <DayView
              todayApptsByBay={todayApptsByBay}
              isDragging={!!draggingItem}
              onDrop={handleScheduleDrop}
            />
          )}
          {view === "Week" && (
            <WeekView
              techs={techs.map((t) => ({ id: t.id, name: t.name, utilization: t.utilization, initials: t.initials }))}
              apptsByCell={apptsByCell}
            />
          )}
          {view === "List" && (
            <ListView
              appts={appts.filter((a) => a.dayIdx === TODAY_DAY_IDX)}
              techMap={techMap as Map<string, { name: string; initials: string }>}
            />
          )}
        </div>

        {/* Unscheduled rail */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-4 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Unscheduled
              </h3>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {unscheduled.length} waiting to be scheduled · drag to a bay
              </p>
            </div>
            <ul className="divide-y divide-border">
              {unscheduled.length === 0 ? (
                <li className="px-4 py-6 text-center text-[11px] text-muted-foreground">
                  Nothing waiting — go grab a coffee
                </li>
              ) : (
                unscheduled.map((u) => {
                  const isDragging = draggingItem?.id === u.id;
                  return (
                    <li
                      key={u.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", u.id);
                        setDraggingItem(u);
                      }}
                      onDragEnd={() => setDraggingItem(null)}
                      className={clsx(
                        "cursor-grab px-4 py-2.5 transition-all active:cursor-grabbing",
                        isDragging ? "opacity-40" : "hover:bg-surface/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold">
                          {u.customer}
                        </span>
                        {u.priority === "Fleet" && (
                          <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
                            Fleet
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {u.vehicle}
                      </div>
                      <div className="mt-1 text-[11px]">{u.type}</div>
                      {u.note && (
                        <div className="mt-1 text-[10px] italic text-muted-foreground">
                          {u.note}
                        </div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Legend */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider">Legend</h3>
            <ul className="mt-3 space-y-1.5 text-[11px]">
              <LegendRow color="bg-foreground" label="Service" />
              <LegendRow color="bg-[#3730A3]" label="Inspection" />
              <LegendRow color="bg-accent" label="AI-Estimated" />
              <LegendRow color="bg-success" label="Drop-off" />
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

// ====================================================================
// Day view — bays × time slots
// ====================================================================
function DayView({
  todayApptsByBay,
  isDragging = false,
  onDrop,
}: {
  todayApptsByBay: Map<number, Appointment[]>;
  isDragging?: boolean;
  onDrop?: (bay: number, hour: number) => void;
}) {
  const rowHeight = 28; // px per 30 min
  const startHour = 7;
  const totalSlots = HOURS.length * 2; // 30-min slots
  const [hoverCell, setHoverCell] = useState<{ bay: number; hour: number } | null>(null);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Bay header */}
        <div
          className="grid border-b border-border bg-surface/40"
          style={{ gridTemplateColumns: "70px repeat(5, 1fr)" }}
        >
          <div className="border-r border-border px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Time
          </div>
          {BAYS.map((b, i) => (
            <div
              key={b}
              className="border-r border-border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider last:border-r-0"
            >
              {BAY_LABELS[i]}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "70px repeat(5, 1fr)",
            gridTemplateRows: `repeat(${totalSlots}, ${rowHeight}px)`,
          }}
        >
          {/* Time column */}
          {HOURS.map((h, hi) => (
            <div
              key={`t-${h}`}
              className="col-start-1 border-b border-border bg-surface/20 px-2 pt-1 text-right text-[10px] font-medium text-muted-foreground"
              style={{
                gridRow: `${hi * 2 + 1} / span 2`,
              }}
            >
              {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
            </div>
          ))}

          {/* Bay cells — empty grid (drop targets) */}
          {HOURS.flatMap((h, hi) =>
            BAYS.map((b, bi) => {
              const isHovered =
                hoverCell?.bay === b && hoverCell?.hour === h && isDragging;
              return (
                <div
                  key={`c-${h}-${b}`}
                  onDragOver={(e) => {
                    if (!isDragging || !onDrop) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setHoverCell({ bay: b, hour: h });
                  }}
                  onDragLeave={() => {
                    if (hoverCell?.bay === b && hoverCell?.hour === h) {
                      setHoverCell(null);
                    }
                  }}
                  onDrop={(e) => {
                    if (!onDrop) return;
                    e.preventDefault();
                    onDrop(b, h);
                    setHoverCell(null);
                  }}
                  className={clsx(
                    "border-b border-r border-border transition-colors last:border-r-0",
                    isHovered
                      ? "bg-brand-green-tint ring-1 ring-inset ring-brand-green"
                      : isDragging
                        ? "bg-brand-green/[0.04] hover:bg-brand-green/10"
                        : hi % 2 === 0
                          ? "bg-background"
                          : "bg-surface/20",
                  )}
                  style={{
                    gridColumn: bi + 2,
                    gridRow: `${hi * 2 + 1} / span 2`,
                  }}
                />
              );
            }),
          )}

          {/* Now line (1:30 PM) */}
          <div
            className="pointer-events-none col-start-2 col-end-7 z-10 flex items-center"
            style={{
              gridRow: `${(13 - startHour) * 2 + 1} / span 1`,
              transform: "translateY(50%)",
            }}
          >
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-destructive" />
            <span className="h-px flex-1 bg-destructive" />
          </div>

          {/* Appointment blocks */}
          {Array.from(todayApptsByBay.entries()).flatMap(([bay, appts]) =>
            appts.map((a) => {
              const startSlot = (a.startHour - startHour) * 2;
              const spanSlots = a.durationHrs * 2;
              return (
                <div
                  key={a.id}
                  className={clsx(
                    "z-20 m-0.5 overflow-hidden rounded border-l-4 bg-background p-1.5 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-foreground/20",
                    categoryStripe[a.category],
                  )}
                  style={{
                    gridColumn: bay + 1,
                    gridRow: `${startSlot + 1} / span ${spanSlots}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] font-bold">
                      {a.unit}
                    </span>
                    <span
                      className={clsx(
                        "shrink-0 rounded-full px-1 py-px text-[8px] font-semibold uppercase",
                        statusBadge[a.status] ?? "bg-surface text-foreground",
                      )}
                    >
                      #{a.ro}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {a.customer}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
                    <Clock className="h-2 w-2" />
                    {a.startHour > 12 ? `${a.startHour - 12}p` : `${a.startHour}a`}
                    -
                    {a.startHour + a.durationHrs > 12
                      ? `${a.startHour + a.durationHrs - 12}p`
                      : `${a.startHour + a.durationHrs}a`}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// Week view — techs × days
// ====================================================================
function WeekView({
  techs,
  apptsByCell,
}: {
  techs: Array<{ id: string; name: string; utilization: number; initials: string }>;
  apptsByCell: Map<string, Appointment[]>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div
          className="grid border-b border-border bg-surface/40"
          style={{ gridTemplateColumns: "180px repeat(6, 1fr)" }}
        >
          <div className="border-r border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Technician
          </div>
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className={clsx(
                "border-r border-border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider last:border-r-0",
                i === TODAY_DAY_IDX && "bg-accent/15 text-foreground",
              )}
            >
              {d} {i === TODAY_DAY_IDX && <span className="ml-1 rounded bg-accent px-1 text-[9px] text-accent-foreground">TODAY</span>}
            </div>
          ))}
        </div>

        {/* Rows */}
        {techs.map((t) => (
          <div
            key={t.id}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: "180px repeat(6, 1fr)" }}
          >
            <div className="border-r border-border bg-surface/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold">{t.name.split(" ")[0]}</div>
                  <div className="text-[10px] text-muted-foreground">{t.utilization}% util</div>
                </div>
              </div>
            </div>
            {DAY_LABELS.map((_, dayIdx) => {
              const appts = apptsByCell.get(`${t.id}:${dayIdx}`) ?? [];
              return (
                <div
                  key={dayIdx}
                  className={clsx(
                    "min-h-[90px] border-r border-border p-1 last:border-r-0",
                    dayIdx === TODAY_DAY_IDX && "bg-accent/5",
                  )}
                >
                  <div className="space-y-1">
                    {appts.map((a) => (
                      <div
                        key={a.id}
                        className={clsx(
                          "rounded border-l-2 bg-background px-1.5 py-1 text-[10px] shadow-sm",
                          categoryStripe[a.category],
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-semibold">{a.unit}</span>
                          <span className="shrink-0 text-[9px] text-muted-foreground">
                            #{a.ro}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[9px] text-muted-foreground">
                          {a.startHour > 12 ? `${a.startHour - 12}p` : `${a.startHour}a`}
                          -
                          {a.startHour + a.durationHrs > 12
                            ? `${a.startHour + a.durationHrs - 12}p`
                            : `${a.startHour + a.durationHrs}a`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// List view
// ====================================================================
function ListView({
  appts,
  techMap,
}: {
  appts: Appointment[];
  techMap: Map<string, { name: string; initials: string }>;
}) {
  const sorted = [...appts].sort((a, b) => a.startHour - b.startHour);
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
        <tr>
          <th className="px-3 py-2 text-left font-semibold">Time</th>
          <th className="px-3 py-2 text-left font-semibold">Customer / Vehicle</th>
          <th className="px-3 py-2 text-left font-semibold">RO</th>
          <th className="px-3 py-2 text-left font-semibold">Tech</th>
          <th className="px-3 py-2 text-left font-semibold">Bay</th>
          <th className="px-3 py-2 text-left font-semibold">Type</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((a) => {
          const t = techMap.get(a.techId);
          return (
            <tr key={a.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5 text-xs tabular-nums">
                {a.startHour > 12 ? `${a.startHour - 12}:00 PM` : `${a.startHour}:00 AM`}
              </td>
              <td className="px-3 py-2.5">
                <div className="text-xs font-semibold">{a.customer}</div>
                <div className="text-[10px] text-muted-foreground">{a.unit}</div>
              </td>
              <td className="px-3 py-2.5 text-xs">#{a.ro}</td>
              <td className="px-3 py-2.5 text-xs">{t?.name?.split(" ")[0] ?? "—"}</td>
              <td className="px-3 py-2.5 text-xs">Bay {a.bay}</td>
              <td className="px-3 py-2.5">
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold">
                  {categoryLabel[a.category]}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ====================================================================
// Helpers
// ====================================================================
function MiniStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Calendar;
  accent?: "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div
        className={clsx(
          "mt-1.5 text-xl font-semibold tabular-nums",
          accent === "success" && "text-success",
          accent === "warning" && "text-[#991B1B]",
          accent === "danger" && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={clsx("h-2 w-2 rounded-sm", color)} />
      <span>{label}</span>
    </li>
  );
}
