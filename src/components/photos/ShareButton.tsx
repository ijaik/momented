"use client";
import { Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useOptimistic, useRef, useState, useTransition } from "react";

const ShareDialog = dynamic(() => import("./ShareDialog"), { ssr: false });
export interface ShareButtonProps {
  title?: string;
  photoId?: string | number;
  imageUrl?: string;
  shareCount?: number;
  variant?: "default" | "compact";
  className?: string;
}
export default function ShareButton({
  title = "",
  photoId,
  imageUrl,
  shareCount = 0,
  variant = "default",
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [, startTransition] = useTransition();
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    shareCount,
    (current, increment: number) => current + increment,
  );
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  const handleShareSuccess = () => {
    startTransition(() => {
      setOptimisticCount(1);
    });
  };
  return (
    <>
      {variant === "compact" ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Share photograph"
          title="Share"
          className={
            className ||
            "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-soft"
          }
        >
          <Share2 size={14} aria-hidden="true" className="shrink-0" />
          <span className="hidden sm:inline">Share</span>
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={
            className ||
            "inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-md bg-solid px-4 py-2 text-sm font-medium text-on-solid transition-opacity hover:opacity-85 sm:px-5"
          }
        >
          <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap">
            <Share2 size={16} aria-hidden="true" className="shrink-0" />
            Share
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-[13px] tabular-nums opacity-60"
          >
            {optimisticCount}
          </span>
        </button>
      )}
      {isOpen && (
        <ShareDialog
          title={title}
          photoId={photoId}
          imageUrl={imageUrl}
          onClose={close}
          onShareSuccess={handleShareSuccess}
        />
      )}
    </>
  );
}
