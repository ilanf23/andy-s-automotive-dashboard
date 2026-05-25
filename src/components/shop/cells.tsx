import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { Truck, User } from "lucide-react";

/** Money cell — right-aligned, tabular nums, optional muted zero. */
export function MoneyCell({
  value,
  className,
  showZero = true,
}: {
  value: number;
  className?: string;
  showZero?: boolean;
}) {
  if (value === 0 && !showZero) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className={clsx("tabular-nums", className)}>
      ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </span>
  );
}

/** Date cell — short formatted date with optional "today" highlight. */
export function DateCell({
  date,
  className,
}: {
  date: string | Date;
  className?: string;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const fmt = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      d.getFullYear() === today.getFullYear() ? undefined : "2-digit",
  });
  return (
    <span className={clsx("tabular-nums", isToday && "font-semibold", className)}>
      {fmt}
    </span>
  );
}

/** Customer reference chip — links to customer detail. */
export function CustomerChip({
  customerId,
  name,
  type,
}: {
  customerId: string;
  name: string;
  type?: "Fleet" | "Retail";
}) {
  return (
    <Link
      to="/customers/$id"
      params={{ id: customerId }}
      className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-foreground/85 transition-colors hover:text-foreground hover:underline"
    >
      <User className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
      {type === "Fleet" && (
        <span className="rounded-full bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">
          F
        </span>
      )}
    </Link>
  );
}

/** Vehicle reference chip — links to vehicle detail. */
export function VehicleChip({
  vehicleId,
  unit,
  vehicle,
}: {
  vehicleId: string;
  unit: string;
  vehicle?: string;
}) {
  return (
    <Link
      to="/vehicles/$id"
      params={{ id: vehicleId }}
      className="group inline-flex min-w-0 items-center gap-1.5 rounded-md text-xs font-medium text-foreground/85 transition-colors hover:text-foreground"
    >
      <Truck className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="truncate font-semibold group-hover:underline">
          {unit}
        </span>
        {vehicle && (
          <span className="ml-1 truncate text-muted-foreground">
            · {vehicle}
          </span>
        )}
      </span>
    </Link>
  );
}

/** RO reference chip — links to RO detail. */
export function RoChip({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <Link
      to="/repair-orders/$id"
      params={{ id }}
      className={clsx(
        "inline-flex items-center rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-foreground transition-colors hover:bg-foreground hover:text-background",
        className,
      )}
    >
      #{id}
    </Link>
  );
}

/** Standard table row hover/border. */
export function TableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={clsx(
        "border-b border-border transition-colors hover:bg-surface/40",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/** Standard table header. */
export function TableHeader({
  cols,
}: {
  cols: Array<{ id: string; label: string; align?: "left" | "right" | "center"; w?: string }>;
}) {
  return (
    <thead>
      <tr className="border-b border-border bg-surface/40">
        {cols.map((c) => (
          <th
            key={c.id}
            className={clsx(
              "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
              c.align === "right" && "text-right",
              c.align === "center" && "text-center",
              c.align !== "right" && c.align !== "center" && "text-left",
            )}
            style={c.w ? { width: c.w } : undefined}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
