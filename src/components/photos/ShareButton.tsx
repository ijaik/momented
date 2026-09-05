"use client";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Icons } from "@/components/ui/Icons";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
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
          imageUrl={imageUrl}
          onClose={close}
        />
      )}
    </>
  );
}
