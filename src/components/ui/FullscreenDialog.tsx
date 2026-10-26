"use client";
import { Minimize2 } from "lucide-react";
import type { ReactNode } from "react";

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
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-paper/95 backdrop-blur-2xl p-4 sm:p-6 select-none animate-[dialog-backdrop-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
    >
      <header className="flex w-full items-center justify-between gap-4 border-b border-line/60 pb-3.5">
        <div className="min-w-0">
          <h2 className="truncate font-serif text-lg font-medium tracking-tight text-ink sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <div className="truncate text-xs text-muted">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit fullscreen (Esc)"
            title="Minimize (Esc)"
            className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/10 px-3.5 py-1.5 text-xs font-medium text-signal transition-all duration-100 hover:bg-signal/20 active:scale-95"
          >
            <Minimize2 size={15} aria-hidden="true" />
            <span>Minimize</span>
          </button>
        </div>
      </header>
      <div className="relative my-auto flex h-[calc(100vh-170px)] w-full items-center justify-center overflow-hidden touch-pan-y select-none">
        {children}
      </div>
      {footer && (
        <footer className="w-full border-t border-line/60 pt-3">
          {footer}
        </footer>
      )}
    </div>
  );
}
