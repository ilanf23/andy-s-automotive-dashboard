import clsx from "clsx";

export type TabItem = {
  id: string;
  label: string;
  count?: number;
  badgeTone?: "default" | "accent" | "danger" | "success";
};

type Props = {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** "underline" = tabs sit on top of a divider (detail pages); "pills" = filter chips (list filters) */
  variant?: "underline" | "pills";
  className?: string;
};

export function TabStrip({
  tabs,
  activeId,
  onChange,
  variant = "underline",
  className,
}: Props) {
  if (variant === "pills") {
    return (
      <div className={clsx("flex flex-wrap items-center gap-1.5", className)}>
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground/80 hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <span>{t.label}</span>
              {t.count != null && (
                <span
                  className={clsx(
                    "rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : t.badgeTone === "accent"
                        ? "bg-accent text-accent-foreground"
                        : t.badgeTone === "danger"
                          ? "bg-destructive/15 text-destructive"
                          : t.badgeTone === "success"
                            ? "bg-success/15 text-success"
                            : "bg-surface text-muted-foreground",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx("border-b border-border", className)}>
      <div className="flex items-end gap-0 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={clsx(
                "group relative inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{t.label}</span>
              {t.count != null && (
                <span
                  className={clsx(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted-foreground",
                  )}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
