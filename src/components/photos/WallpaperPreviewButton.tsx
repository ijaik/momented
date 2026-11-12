"use client";
import { Smartphone } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Photo } from "@/types";

const WallpaperPreviewDialog = dynamic(
  () => import("./WallpaperPreviewDialog"),
  { ssr: false },
);
export interface WallpaperPreviewButtonProps {
  photo: Photo;
  fileName?: string;
  variant?: "default" | "compact";
  className?: string;
}
export default function WallpaperPreviewButton({
  photo,
  fileName,
  variant = "default",
  className,
}: WallpaperPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
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
          aria-label="Preview photograph as device wallpaper"
          title="Preview as Wallpaper"
          className={
            className ||
            "inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-surface/80 backdrop-blur-xs px-3 py-1.5 text-xs font-medium text-ink transition-all duration-100 hover:bg-soft active:scale-98 cursor-pointer"
          }
        >
          <Smartphone size={14} aria-hidden="true" className="shrink-0" />
          <span className="hidden sm:inline">Wallpaper</span>
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
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink transition-all duration-100 hover:bg-soft hover:border-ink/20 active:scale-98 cursor-pointer"
          }
        >
          <Smartphone
            size={15}
            aria-hidden="true"
            className="shrink-0 text-muted"
          />
          <span className="truncate">Wallpaper</span>
        </button>
      )}
      {isOpen && (
        <WallpaperPreviewDialog
          photo={photo}
          fileName={fileName}
          isOpen={isOpen}
          onClose={close}
        />
      )}
    </>
  );
}
