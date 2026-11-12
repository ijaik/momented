"use client";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import toast, { type ToastOptions } from "react-hot-toast";
export { toast };
export interface ConfirmActionOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}
export const notifySuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    icon: <Check size={14} className="text-ink shrink-0" aria-hidden="true" />,
    ...options,
  });
};
export const notifyError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    icon: (
      <AlertCircle
        size={14}
        className="text-danger shrink-0"
        aria-hidden="true"
      />
    ),
    ...options,
  });
};
export const notifyLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    icon: (
      <Loader2
        size={14}
        className="text-ink animate-spin shrink-0"
        aria-hidden="true"
      />
    ),
    ...options,
  });
};
/**
 * Custom interactive confirmation toast using react-hot-toast.
 * - Explicit Delete and Cancel actions.
 * - Never executes destructive operations without an explicit click on the confirm button.
 * - Dismissing or expiring the toast resolves to false (action cancelled).
 */
export function confirmAction({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDestructive = true,
}: ConfirmActionOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const handleConfirm = (toastId: string) => {
      if (settled) return;
      settled = true;
      toast.dismiss(toastId);
      resolve(true);
    };
    const handleCancel = (toastId: string) => {
      if (settled) return;
      settled = true;
      toast.dismiss(toastId);
      resolve(false);
    };
    toast.custom(
      (t) => {
        // If the toast is dismissed or expires without clicking confirm, cancel safely.
        if (!t.visible && !settled) {
          settled = true;
          resolve(false);
        }
        return (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-toast-title"
            aria-describedby={message ? "confirm-toast-desc" : undefined}
            className={`pointer-events-auto flex w-full max-w-sm flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-xl text-ink transition-all duration-200 ${
              t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div>
              <h4
                id="confirm-toast-title"
                className="font-sans text-sm font-semibold text-ink"
              >
                {title}
              </h4>
              {message && (
                <p
                  id="confirm-toast-desc"
                  className="mt-1 font-sans text-xs text-muted leading-relaxed"
                >
                  {message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/60">
              <button
                type="button"
                onClick={() => handleCancel(t.id)}
                className="rounded-full border border-line px-3.5 py-1.5 font-sans text-xs font-medium text-muted hover:bg-soft hover:text-ink transition-colors active:scale-98"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(t.id)}
                className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors active:scale-98 ${
                  isDestructive
                    ? "bg-danger text-white hover:bg-danger/90"
                    : "bg-solid text-on-solid hover:opacity-90"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        );
      },
      {
        duration: 12000,
        position: "top-center",
      },
    );
  });
}
