"use client";
import { Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { incrementShare } from "@/actions/download";

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
  title = "Untitled Momented",
  photoId,
  imageUrl,
  shareCount = 0,
  variant = "default",
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    shareCount,
    (current: number) => current + 1,
  );
  const [, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  const handleTrackShare = () => {
    startTransition(async () => {
      setOptimisticCount(1);
      if (photoId)
        try {
          await incrementShare(photoId);
        } catch (err) {
          console.error("Failed to track share:", err);
        }
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
            "inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-surface/80 backdrop-blur-xs px-3 py-1.5 text-xs font-medium text-ink transition-all duration-100 hover:bg-soft active:scale-95"
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
            "inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-xl bg-solid px-4 py-2 text-sm font-medium text-on-solid shadow-xs transition-all duration-100 hover:opacity-90 active:scale-[0.98] sm:px-5"
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
          onTrackShare={handleTrackShare}
        />
      )}
    </>
  );
}
