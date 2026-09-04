"use client";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Icons } from "@/components/ui/Icons";

const ShareDialog = dynamic(() => import("./ShareDialog"), { ssr: false });
export interface ShareButtonProps {
  title?: string;
  photoId?: string | number;
  url?: string;
  imageUrl?: string;
  shareCount?: number;
  variant?: "default" | "icon";
  className?: string;
}
export default function ShareButton({
  title = "",
  photoId,
  url,
  imageUrl,
  shareCount = 0,
  variant = "default",
  className = "",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const open = () => setIsOpen(true);
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  if (variant === "icon") {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Share ${title || "photo"}`}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-soft ${className}`}
        >
          <Icons.Share className="h-4.5 w-4.5" />
        </button>
        {isOpen && (
          <ShareDialog
            title={title}
            photoId={photoId}
            url={url}
            imageUrl={imageUrl}
            onClose={close}
          />
        )}
      </>
    );
  }
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="inline-flex w-full items-center justify-between gap-3 rounded-md bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-opacity hover:opacity-85"
      >
        <span className="inline-flex items-center gap-2">
          <Icons.Share className="h-4 w-4" />
          Share
        </span>
        <span
          aria-hidden="true"
          className="text-[13px] tabular-nums opacity-60"
        >
          {shareCount}
        </span>
      </button>
      {isOpen && (
        <ShareDialog
          title={title}
          photoId={photoId}
          url={url}
          imageUrl={imageUrl}
          onClose={close}
        />
      )}
    </>
  );
}
