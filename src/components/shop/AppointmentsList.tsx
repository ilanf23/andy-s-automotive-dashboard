import clsx from "clsx";
import { Calendar, ChevronRight, Truck } from "lucide-react";

export type AppointmentRow = {
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  type:
    | "Drop-off"
    | "Pickup"
    | "Diagnostic"
    | "Inspection"
    | "Scheduled Service"
    | "Estimate Review";
  bay?: string;
  confirmed?: boolean;
};

type Props = {
  rows: AppointmentRow[];
};

const typeStyles: Record<AppointmentRow["type"], string> = {
  "Drop-off": "bg-[#E0E7FF] text-[#3730A3]",
  Pickup: "bg-success/15 text-success",
  Diagnostic: "bg-[#FEF3C7] text-[#92400E]",
  Inspection: "bg-[#DBEAFE] text-[#1E40AF]",
  "Scheduled Service": "bg-surface text-foreground",
  "Estimate Review": "bg-accent/30 text-[#991B1B]",
};

export function AppointmentsList({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
        <Calendar className="mx-auto mb-2 h-5 w-5" />
        No appointments today
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface/40"
        >
          <div className="w-14 shrink-0 text-right">
            <div className="text-xs font-semibold tabular-nums">{a.time}</div>
            {a.bay && (
              <div className="text-[10px] text-muted-foreground">
                Bay {a.bay}
              </div>
            )}
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface">
            <Truck className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{a.customer}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {a.vehicle}
            </div>
          </div>
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              typeStyles[a.type],
            )}
          >
            {a.type}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </li>
      ))}
    </ul>
  );
}
