import * as AlertDialog from "@radix-ui/react-alert-dialog";
import clsx from "clsx";

type Tone = "default" | "danger" | "success";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void | Promise<void>;
};

const confirmTone: Record<Tone, string> = {
  default: "bg-foreground text-background hover:opacity-90",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  success: "bg-brand-green text-brand-green-foreground hover:opacity-90",
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-5 shadow-2xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <AlertDialog.Title className="text-sm font-semibold">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-1.5 text-xs text-muted-foreground">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-5 flex items-center justify-end gap-2">
            <AlertDialog.Cancel className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface">
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                void onConfirm();
              }}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-semibold",
                confirmTone[tone],
              )}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
