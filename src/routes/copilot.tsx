import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Plus,
  ChevronRight,
  Wrench,
  User,
  Truck,
  FileText,
  ClipboardCheck,
  Database,
  Activity,
  Code2,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { CopilotChat } from "@/components/ai/copilot/CopilotChat";
import type { ContextEntity } from "@/components/ai/copilot/types";

export const Route = createFileRoute("/copilot")({
  component: CopilotPage,
});

// Recent conversations - hardcoded for demo
const RECENT_CHATS = [
  { id: "c1", title: "Build estimate for MT-47", time: "2m ago", active: true },
  { id: "c2", title: "Why is City Form RO stuck?", time: "1h ago" },
  { id: "c3", title: "Schedule Reliable Ducks", time: "3h ago" },
  { id: "c4", title: "Top customers by LTV", time: "Yesterday" },
  { id: "c5", title: "Labor GP - real numbers", time: "Yesterday" },
  { id: "c6", title: "Send Northpoint demand letter", time: "2 days ago" },
];

const TOOL_CAPABILITIES = [
  { icon: Database, label: "Read RO / estimate / inspection / customer / vehicle", group: "Read" },
  { icon: Database, label: "Query analytics - sales, labor, parts, AR, fleet", group: "Read" },
  { icon: Database, label: "Search shop history + Mitchell1 + vendor catalogs", group: "Read" },
  { icon: Wrench, label: "Create RO, estimate, appointment, payment", group: "Write" },
  { icon: Activity, label: "Update RO status, apply estimate lines, assign tech", group: "Write" },
  { icon: MessageSquare, label: "Send SMS, email, fleet platform submission", group: "Communicate" },
  { icon: FileText, label: "Draft documents - demand letters, contracts, statements", group: "Communicate" },
];

function CopilotPage() {
  const [context, setContext] = useState<ContextEntity | null>(null);
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-[260px_1fr_320px] gap-0 overflow-hidden rounded-lg border border-border bg-background -mx-4 -my-6 md:-mx-6">
      {/* ====================================================================== */}
      {/* LEFT - Chat history rail                                                */}
      {/* ====================================================================== */}
      <aside className="flex min-h-0 flex-col border-r border-border bg-surface/40">
        <div className="border-b border-border p-3">
          <button
            type="button"
            onClick={() => setChatKey((k) => k + 1)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-green px-3 py-2 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
          >
            <Plus className="h-3 w-3" />
            New chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent
          </div>
          <ul className="space-y-0.5 px-1.5">
            {RECENT_CHATS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    toast.info(`Loading conversation: ${c.title}`);
                    setChatKey((k) => k + 1);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
                    c.active
                      ? "bg-foreground text-background"
                      : "hover:bg-surface/80",
                  )}
                >
                  <MessageSquare
                    className={clsx(
                      "h-3 w-3 shrink-0",
                      c.active ? "" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.title}</div>
                    <div
                      className={clsx(
                        "truncate text-[9px]",
                        c.active ? "text-background/60" : "text-muted-foreground",
                      )}
                    >
                      {c.time}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer - capabilities summary */}
        <div className="border-t border-border bg-background px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-brand-green-soft" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green-soft">
              Full platform access
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Read every record · write to most surfaces · always pauses for approval on money + customer actions.
          </p>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* CENTER - Chat thread                                                    */}
      {/* ====================================================================== */}
      <div className="min-h-0">
        <CopilotChat key={chatKey} onContextChange={setContext} />
      </div>

      {/* ====================================================================== */}
      {/* RIGHT - Context panel                                                   */}
      {/* ====================================================================== */}
      <aside className="flex min-h-0 flex-col border-l border-border bg-surface/40">
        <div className="border-b border-border bg-background px-4 py-2.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {context ? "In context" : "Tool access"}
          </h3>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {context ? <ContextCard context={context} /> : <ToolAccessPanel />}
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// Context card - shown in the right panel when AI is working on an entity
// ============================================================================

function ContextCard({ context }: { context: ContextEntity }) {
  const ICONS: Record<ContextEntity["type"], typeof User> = {
    ro: Wrench,
    customer: User,
    vehicle: Truck,
    estimate: FileText,
    inspection: ClipboardCheck,
  };
  const Icon = ICONS[context.type];
  const targetRoute =
    context.type === "ro"
      ? `/repair-orders/${context.id}`
      : context.type === "customer"
        ? `/customers/${context.id}`
        : context.type === "vehicle"
          ? `/vehicles/${context.id}`
          : context.type === "estimate"
            ? `/estimates/${context.id}`
            : `/inspections/${context.id}`;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-brand-green/30 bg-brand-green-tint p-3">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-green text-brand-green-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-brand-green px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-green-foreground">
                {context.type}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold leading-tight">
              {context.label}
            </div>
            {context.sub && (
              <div className="mt-0.5 text-[11px] text-foreground/80">
                {context.sub}
              </div>
            )}
          </div>
        </div>
      </div>

      {context.fields && context.fields.length > 0 && (
        <div className="rounded-lg border border-border bg-background">
          <div className="border-b border-border px-3 py-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h4>
          </div>
          <ul className="divide-y divide-border">
            {context.fields.map((f, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 px-3 py-1.5 text-[11px]"
              >
                <span className="text-muted-foreground">{f.label}</span>
                <span className="text-right font-semibold">{f.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to={targetRoute as string}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-semibold hover:bg-surface"
      >
        Open in {context.type === "ro" ? "Repair Orders" : context.type[0].toUpperCase() + context.type.slice(1) + "s"}
        <ChevronRight className="h-3 w-3" />
      </Link>

      {/* Activity log placeholder */}
      <div className="rounded-lg border border-border bg-background">
        <div className="border-b border-border px-3 py-1.5">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            What the AI sees
          </h4>
        </div>
        <ul className="space-y-1 p-2.5 text-[10px]">
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-green" />
            Full RO history (12 prior visits)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-green" />
            All inspection findings + photos
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-green" />
            Customer message history (47 threads)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-green" />
            Payment history + AR aging
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-green" />
            Worldpac live pricing for this VIN
          </li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Tool access panel - shown when no context is active
// ============================================================================

function ToolAccessPanel() {
  const grouped = TOOL_CAPABILITIES.reduce<
    Record<string, typeof TOOL_CAPABILITIES>
  >((acc, t) => {
    (acc[t.group] = acc[t.group] ?? []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-brand-green-soft" />
          <h3 className="text-xs font-semibold">Tool capabilities</h3>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          The AI has access to these functions. Read-only tools run silently;
          write tools always pause for your approval.
        </p>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group}
          </div>
          <ul className="space-y-1">
            {items.map((t, i) => {
              const Icon = t.icon;
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px]"
                >
                  <Icon className="mt-0.5 h-3 w-3 shrink-0 text-brand-green-soft" />
                  <span>{t.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="rounded-lg border border-accent/40 bg-accent/15 p-3">
        <div className="flex items-start gap-1.5">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#991B1B]" />
          <div>
            <h4 className="text-[11px] font-semibold text-[#991B1B]">
              Human-in-the-loop
            </h4>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#991B1B]/85">
              The AI never executes a write action without an explicit approval
              from you. The approval card shows exactly what will happen,
              including dollar impact and recipient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
