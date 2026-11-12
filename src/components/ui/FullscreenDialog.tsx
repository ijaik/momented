"use client";
import { Minimize2 } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useDialogFocusTrap } from "@/lib/hooks/useDialogFocusTrap";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useDialogFocusTrap(containerRef, isOpen, onClose, closeBtnRef);
  if (!isOpen) return null;
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-paper/97 backdrop-blur-2xl p-4 sm:p-6 select-none animate-[dialog-backdrop-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
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
            ref={closeBtnRef}
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
      <div className="relative my-auto flex h-[calc(100dvh-150px)] w-full items-center justify-center overflow-hidden touch-pan-y select-none">
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
