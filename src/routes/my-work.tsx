import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Wrench,
  Clock,
  ArrowRight,
  Play,
  Pause,
  CheckCircle,
  Truck,
  Coffee,
  Square,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { PageShell } from "@/components/shop/PageShell";
import { TabStrip } from "@/components/shop/TabStrip";
import { StatusBadge } from "@/components/shop/StatusBadge";
import { repairOrders } from "@/data/repairOrders";
import { customers } from "@/data/customers";
import { vehicles } from "@/data/vehicles";
import { usd } from "@/lib/format";

type ROState = "assigned" | "in-progress" | "paused" | "done";
type ClockEntry = { type: string; at: Date };

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const Route = createFileRoute("/my-work")({
  component: MyWorkPage,
});

type Tab = "assigned" | "in-progress" | "completed" | "time-clock";

const ME = "TECH-MARCUS"; // pretend logged-in tech

function MyWorkPage() {
  const [tab, setTab] = useState<Tab>("assigned");
  const [clockState, setClockState] = useState<"clocked-in" | "on-break" | "clocked-out">(
    "clocked-in",
  );
  const [roStates, setRoStates] = useState<Record<string, ROState>>({});
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  // Header clock pill timer — counts up while clocked-in. Seed at ~04:38:12 to match prior literal.
  const [seconds, setSeconds] = useState<number>(4 * 3600 + 38 * 60 + 12);

  useEffect(() => {
    if (clockState !== "clocked-in") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [clockState]);

  const setROState = (id: string, s: ROState) => {
    setRoStates((prev) => ({ ...prev, [id]: s }));
  };

  const handleClockChange = (s: "clocked-in" | "on-break" | "clocked-out") => {
    const labelMap: Record<typeof s, string> = {
      "clocked-in": "clock-in",
      "on-break": "break-start",
      "clocked-out": "clock-out",
    } as const;
    setEntries((prev) => [...prev, { type: labelMap[s], at: new Date() }]);
    setClockState(s);
    if (s === "clocked-in") {
      toast.success("Clocked in");
    } else if (s === "on-break") {
      toast.info("On break");
    } else {
      toast.success("Clocked out · today's hours: 8h 14m");
    }
  };

  const myROs = repairOrders.filter((r) => r.technicianId === ME);
  const inProgress = myROs.filter((r) => r.status === "in-progress");
  const assigned = myROs.filter(
    (r) =>
      r.status !== "in-progress" && r.status !== "completed" && r.status !== "ready",
  );
  const completed = myROs.filter(
    (r) => r.status === "completed" || r.status === "ready",
  );

  const tabs = [
    { id: "assigned", label: "Assigned", count: assigned.length },
    {
      id: "in-progress",
      label: "In Progress",
      count: inProgress.length,
      badgeTone: inProgress.length > 0 ? ("accent" as const) : undefined,
    },
    { id: "completed", label: "Completed Today", count: completed.length },
    { id: "time-clock", label: "Time Clock" },
  ];

  const visible =
    tab === "assigned" ? assigned : tab === "in-progress" ? inProgress : completed;

  return (
    <PageShell
      title="My Work"
      description="Marcus Reeves · Lead Diesel Technician"
      actions={
        <div
          className={clsx(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            clockState === "clocked-in" && "border-success bg-success/10 text-success",
            clockState === "on-break" && "border-accent bg-accent/15 text-[#991B1B]",
            clockState === "clocked-out" && "border-border bg-background text-muted-foreground",
          )}
        >
          <div
            className={clsx(
              "h-2 w-2 rounded-full",
              clockState === "clocked-in" && "bg-success animate-pulse",
              clockState === "on-break" && "bg-accent",
              clockState === "clocked-out" && "bg-muted-foreground",
            )}
          />
          <span className="font-semibold capitalize">{clockState.replace("-", " ")}</span>
          <span className="tabular-nums">· {formatTimer(seconds)}</span>
        </div>
      }
    >
      {/* My day */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DayStat label="Hours Today" value="4.6" sub="of 8.0" icon={Clock} />
        <DayStat label="Billed" value="4.2" sub="hrs" icon={Wrench} />
        <DayStat label="Efficiency" value="91%" sub="↑ 4pts" icon={CheckCircle} />
        <DayStat label="ROs Today" value={String(inProgress.length + completed.length)} sub="active" icon={Truck} />
      </div>

      <div className="rounded-lg border border-border bg-background">
        <TabStrip tabs={tabs} activeId={tab} onChange={(id) => setTab(id as Tab)} />

        {tab === "time-clock" ? (
          <TimeClockPanel
            state={clockState}
            onChange={handleClockChange}
            entries={entries}
          />
        ) : (
          <div className="divide-y divide-border">
            {visible.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-muted-foreground">
                Nothing here.
              </div>
            ) : (
              visible.map((r) => {
                const c = customers.find((x) => x.id === r.customerId);
                const v = vehicles.find((x) => x.id === r.vehicleId);
                return (
                  <ROCard
                    key={r.id}
                    roId={r.id}
                    customer={c?.name ?? ""}
                    vehicle={v ? `${v.unit} · ${v.year} ${v.make} ${v.model}` : ""}
                    status={r.status}
                    total={r.total}
                    description={r.description}
                    daysInShop={r.daysInShop}
                    active={tab === "in-progress"}
                    roState={roStates[r.id]}
                    onStart={() => {
                      setROState(r.id, "in-progress");
                      toast.success(`Started RO #${r.id}`);
                    }}
                    onPause={() => {
                      setROState(r.id, "paused");
                      toast.info(`Paused RO #${r.id}`);
                    }}
                    onDone={() => {
                      setROState(r.id, "done");
                      toast.success(`Completed RO #${r.id}`);
                    }}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function ROCard({
  roId,
  customer,
  vehicle,
  status,
  total,
  description,
  daysInShop,
  active,
  roState,
  onStart,
  onPause,
  onDone,
}: {
  roId: string;
  customer: string;
  vehicle: string;
  status: any;
  total: number;
  description: string;
  daysInShop: number;
  active: boolean;
  roState?: ROState;
  onStart: () => void;
  onPause: () => void;
  onDone: () => void;
}) {
  const isDone = roState === "done";
  return (
    <div
      className={clsx(
        "px-5 py-4 transition-colors hover:bg-surface/40",
        isDone && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to="/repair-orders/$id"
                params={{ id: roId }}
                className={clsx(
                  "text-sm font-semibold hover:underline",
                  isDone && "line-through",
                )}
              >
                RO #{roId}
              </Link>
              <StatusBadge status={status} />
              {roState && (
                <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {roState}
                </span>
              )}
              {daysInShop >= 3 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  <Clock className="h-2.5 w-2.5" />
                  {daysInShop}d
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs font-semibold">{customer}</div>
            <div className="text-[11px] text-muted-foreground">{vehicle}</div>
            <p className="mt-1 text-[11px] text-foreground/80">{description}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-sm font-semibold tabular-nums">{usd.format(total)}</div>
          {active ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onPause}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-surface"
                title="Pause"
              >
                <Pause className="h-3 w-3" />
                Pause
              </button>
              <button
                onClick={onDone}
                className="inline-flex items-center gap-1 rounded-md bg-success px-2 py-1 text-[10px] font-semibold text-success-foreground hover:opacity-90"
                title="Complete"
              >
                <CheckCircle className="h-3 w-3" />
                Done
              </button>
            </div>
          ) : (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1 rounded-md bg-foreground px-2 py-1 text-[10px] font-semibold text-background hover:opacity-90"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeClockPanel({
  state,
  onChange,
  entries,
}: {
  state: "clocked-in" | "on-break" | "clocked-out";
  onChange: (s: "clocked-in" | "on-break" | "clocked-out") => void;
  entries: ClockEntry[];
}) {
  const seed = [
    { id: "s1", type: "Clock In", time: "08:14 AM", duration: "" },
    { id: "s2", type: "RO #4847 — Started", time: "08:22 AM", duration: "2h 18m" },
    { id: "s3", type: "Break", time: "10:40 AM", duration: "12m" },
    { id: "s4", type: "RO #4847 — Resumed", time: "10:52 AM", duration: "1h 06m" },
    { id: "s5", type: "Lunch", time: "11:58 AM", duration: "32m" },
    { id: "s6", type: "RO #4842 — Started", time: "12:30 PM", duration: "Current" },
  ];
  const userEntries = entries.map((e, i) => ({
    id: `u${i}`,
    type: e.type,
    time: e.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    duration: "",
  }));
  const allEntries = [...seed, ...userEntries];
  return (
    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Today's Time</h3>
        <ul className="space-y-1.5">
          {allEntries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-muted-foreground">{e.time}</span>
                <span className="font-medium">{e.type}</span>
              </div>
              <span className="tabular-nums text-[10px] text-muted-foreground">
                {e.duration}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-surface/30 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Clock Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onChange("clocked-in")}
            className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
              state === "clocked-in"
                ? "border-success bg-success text-success-foreground"
                : "border-border bg-background hover:bg-surface",
            )}
          >
            <Play className="h-3.5 w-3.5" />
            Clock In
          </button>
          <button
            onClick={() => onChange("on-break")}
            className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
              state === "on-break"
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background hover:bg-surface",
            )}
          >
            <Coffee className="h-3.5 w-3.5" />
            Start Break
          </button>
          <button
            onClick={() => onChange("clocked-out")}
            className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
              state === "clocked-out"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-surface",
            )}
          >
            <Square className="h-3.5 w-3.5" />
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}

function DayStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Clock;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
