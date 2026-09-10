"use client";
import { Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

const ShareDialog = dynamic(() => import("./ShareDialog"), { ssr: false });
export interface ShareButtonProps {
  title?: string;
  photoId?: string | number;
  imageUrl?: string;
  shareCount?: number;
}
export default function ShareButton({
  title = "",
  photoId,
  imageUrl,
  shareCount = 0,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(shareCount);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setCount(shareCount);
  }, [shareCount]);
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  const handleShareSuccess = useCallback((newCount?: number) => {
    setCount((prev) => (typeof newCount === "number" ? newCount : prev + 1));
  }, []);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="inline-flex w-full items-center justify-between gap-3 rounded-md bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-opacity hover:opacity-85"
      >
        <span className="inline-flex items-center gap-2">
          <Share2 size={16} aria-hidden="true" />
          Share
        </span>
        <span
          aria-hidden="true"
          className="text-[13px] tabular-nums opacity-60"
        >
          {count}
        </span>
      </button>
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
