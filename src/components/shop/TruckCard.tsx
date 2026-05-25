import { Truck, User, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StatusBadge, type ShopStatus } from "./StatusBadge";

type Props = {
  roId: string;
  unit: string;
  vehicle: string;
  customer: string;
  technician?: string;
  status: ShopStatus;
  daysInShop: number;
  flags?: string[];
};

export function TruckCard({
  roId,
  unit,
  vehicle,
  customer,
  technician,
  status,
  daysInShop,
  flags = [],
}: Props) {
  return (
    <Link
      to="/repair-orders/$id"
      params={{ id: roId }}
      className="group block rounded-lg border border-border bg-background p-4 transition-all hover:border-foreground/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface">
            <Truck className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">{unit}</div>
            <div className="text-[11px] text-muted-foreground">RO #{roId}</div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="truncate text-xs font-medium text-foreground">{vehicle}</div>
        <div className="truncate text-[11px] text-muted-foreground">{customer}</div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <User className="h-3 w-3" />
          {technician ?? "Unassigned"}
        </span>
        <span className="text-muted-foreground">
          {daysInShop} {daysInShop === 1 ? "day" : "days"}
        </span>
      </div>

      {flags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {flags.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              {f}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
