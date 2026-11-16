"use client";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type ConfirmActionOptions,
  registerConfirmHandler,
  registerToastListener,
  type ToastItem,
} from "./notifications";
export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmActionOptions;
    resolve: (val: boolean) => void;
  } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const unregisterToast = registerToastListener((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    });
    const unregisterConfirm = registerConfirmHandler((options, resolve) => {
      setConfirmState({ options, resolve });
    });
    return () => {
      unregisterToast();
      unregisterConfirm();
    };
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmState) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) dialog.close();
  }, [confirmState]);
  const handleCloseConfirm = (confirmed: boolean) => {
    if (confirmState) {
      confirmState.resolve(confirmed);
      setConfirmState(null);
    }
    dialogRef.current?.close();
  };
  return (
    <>
      {/* Toast notifications container */}
      <section
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed top-5 inset-x-0 z-100 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-surface/95 px-4 py-2.5 text-xs font-sans text-ink shadow-lg backdrop-blur-md animate-[dialog-panel-in_180ms_cubic-bezier(0.16,1,0.3,1)] max-w-sm"
          >
            {toast.type === "success" && (
              <Check
                size={14}
                className="shrink-0 text-ink"
                aria-hidden="true"
              />
            )}
            {toast.type === "error" && (
              <AlertCircle
                size={14}
                className="shrink-0 text-danger"
                aria-hidden="true"
              />
            )}
            {toast.type === "info" && (
              <Loader2
                size={14}
                className="shrink-0 animate-spin text-ink"
                aria-hidden="true"
              />
            )}
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              aria-label="Dismiss notification"
              className="ml-2 text-muted hover:text-ink cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>
      {/* Confirmation modal using native <dialog> */}
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          handleCloseConfirm(false);
        }}
        className="m-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl text-ink backdrop:bg-black/40 backdrop:backdrop-blur-xs max-w-sm w-full outline-hidden [&:not([open])]:hidden"
      >
        {confirmState && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink">
                {confirmState.options.title}
              </h3>
              {confirmState.options.message && (
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  {confirmState.options.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/60">
              <button
                type="button"
                onClick={() => handleCloseConfirm(false)}
                className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-muted hover:bg-soft hover:text-ink cursor-pointer"
              >
                {confirmState.options.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => handleCloseConfirm(true)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium text-white cursor-pointer ${
                  confirmState.options.isDestructive
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-solid hover:opacity-90"
                }`}
              >
                {confirmState.options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
