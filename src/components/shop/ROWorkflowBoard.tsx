import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, Truck, User } from "lucide-react";
import clsx from "clsx";
import type { ShopStatus } from "./StatusBadge";

export type WorkflowCard = {
  roId: string;
  unit: string;
  vehicle: string;
  customer: string;
  technician?: string;
  status: ShopStatus;
  daysInShop: number;
  total: number;
  flagged?: boolean;
};

export type WorkflowColumn = {
  status: ShopStatus;
  label: string;
  color: string;
  cards: WorkflowCard[];
};

type Props = {
  columns: WorkflowColumn[];
  /** Called when a card is dragged from one column to another */
  onMove?: (roId: string, fromStatus: ShopStatus, toStatus: ShopStatus) => void;
};

export function ROWorkflowBoard({ columns, onMove }: Props) {
  const [draggingRO, setDraggingRO] = useState<{
    roId: string;
    fromStatus: ShopStatus;
  } | null>(null);
  const [hoverColumn, setHoverColumn] = useState<ShopStatus | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    roId: string,
    fromStatus: ShopStatus,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", roId);
    setDraggingRO({ roId, fromStatus });
  };

  const handleDragEnd = () => {
    setDraggingRO(null);
    setHoverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: ShopStatus) => {
    if (!draggingRO || !onMove) return;
    if (draggingRO.fromStatus === status) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent, status: ShopStatus) => {
    // only clear if leaving the column itself (not a child)
    if (e.currentTarget === e.target && hoverColumn === status) {
      setHoverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toStatus: ShopStatus) => {
    e.preventDefault();
    if (!draggingRO || !onMove) return;
    if (draggingRO.fromStatus === toStatus) return;
    onMove(draggingRO.roId, draggingRO.fromStatus, toStatus);
    setDraggingRO(null);
    setHoverColumn(null);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-full gap-3 pb-1">
        {columns.map((col) => {
          const isDropTarget =
            draggingRO &&
            draggingRO.fromStatus !== col.status &&
            !!onMove;
          const isHovered = hoverColumn === col.status && isDropTarget;
          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={clsx(
                "flex w-[260px] shrink-0 flex-col rounded-lg border bg-surface/40 transition-all",
                isHovered
                  ? "border-brand-green ring-2 ring-brand-green/30 bg-brand-green-tint/50"
                  : isDropTarget
                    ? "border-dashed border-foreground/40"
                    : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="truncate text-xs font-semibold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-[10px] font-semibold text-muted-foreground">
                  {col.cards.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {col.cards.length === 0 ? (
                  <div
                    className={clsx(
                      "rounded-md border border-dashed px-3 py-6 text-center text-[11px] transition-colors",
                      isHovered
                        ? "border-brand-green bg-background/60 text-brand-green-soft font-semibold"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {isHovered ? "Drop here" : "No vehicles"}
                  </div>
                ) : (
                  col.cards.map((c) => {
                    const isDragging = draggingRO?.roId === c.roId;
                    return (
                      <Link
                        key={c.roId}
                        to="/repair-orders/$id"
                        params={{ id: c.roId }}
                        draggable={!!onMove}
                        onDragStart={(e) => handleDragStart(e, c.roId, col.status)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          "group block rounded-md border bg-background p-2.5 transition-all hover:border-foreground/40 hover:shadow-sm",
                          onMove && "cursor-grab active:cursor-grabbing",
                          isDragging
                            ? "border-foreground/40 opacity-40"
                            : "border-border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface">
                              <Truck className="h-3.5 w-3.5 text-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold">
                                {c.unit}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                RO #{c.roId}
                              </div>
                            </div>
                          </div>
                          {c.flagged && (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                          )}
                        </div>
                        <div className="mt-2 truncate text-[11px] text-foreground/80">
                          {c.vehicle}
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {c.customer}
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[80px]">
                              {c.technician ?? "Unassigned"}
                            </span>
                          </span>
                          <span
                            className={clsx(
                              "flex items-center gap-1",
                              c.daysInShop >= 3 && "text-destructive",
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {c.daysInShop}d
                          </span>
                        </div>
                        {c.total > 0 && (
                          <div className="mt-1.5 text-right text-[11px] font-semibold tabular-nums">
                            ${c.total.toLocaleString()}
                          </div>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
