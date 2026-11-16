"use client";
import { Minimize2 } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

interface FullscreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
}
export default function FullscreenDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  actions,
  footer,
  children,
  ariaLabel = "Fullscreen view",
}: FullscreenDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      if (dialog?.open) dialog.close();
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none [&:not([open])]:hidden open:flex flex-col justify-between overflow-hidden bg-paper/97 backdrop-blur-2xl safe-fullscreen-inset select-none border-0 outline-hidden overscroll-contain animate-[dialog-backdrop-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
    >
      <header className="flex w-full items-center justify-between gap-4 border-b border-line/60 pb-3.5">
        <div className="min-w-0">
          <h2 className="font-serif text-lg tracking-tight text-ink sm:text-xl">
            {title}
          </h2>
          {subtitle}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit fullscreen (Esc)"
            title="Minimize (Esc)"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted transition-all duration-100 hover:bg-soft hover:text-ink active:scale-98 cursor-pointer"
          >
            <Minimize2 size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Minimize</span>
          </button>
        </div>
      </header>
      <div className="relative my-auto flex flex-1 min-h-0 w-full items-center justify-center overflow-hidden touch-pan-y select-none">
        {children}
      </div>
      {footer && (
        <footer className="w-full border-t border-line/60 pt-3">
          {footer}
        </footer>
      )}
    </dialog>
  );
}
