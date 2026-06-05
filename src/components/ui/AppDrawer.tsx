import { Drawer as Vaul } from "vaul";
import { X } from "lucide-react";
import clsx from "clsx";

type Side = "right" | "left" | "bottom";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: Side;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Side-drawer for "more details" panels - RO peek, vehicle quick view, etc.
 * Same chrome as Modal so things feel consistent.
 */
export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  footer,
  children,
}: Props) {
  const direction = side === "right" ? "right" : side === "left" ? "left" : "bottom";
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} direction={direction}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Vaul.Content
          className={clsx(
            "fixed z-50 flex flex-col border-border bg-background outline-none shadow-2xl",
            side === "right" && "right-0 top-0 h-screen w-full max-w-md border-l",
            side === "left" && "left-0 top-0 h-screen w-full max-w-md border-r",
            side === "bottom" && "bottom-0 left-0 right-0 max-h-[85vh] border-t rounded-t-lg",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
            <div className="min-w-0">
              <Vaul.Title className="text-sm font-semibold">{title}</Vaul.Title>
              {description && (
                <Vaul.Description className="mt-0.5 text-[11px] text-muted-foreground">
                  {description}
                </Vaul.Description>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/40 px-5 py-3">
              {footer}
            </div>
          )}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
