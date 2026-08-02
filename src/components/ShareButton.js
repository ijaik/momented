"use client";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Icons } from "@/components/ui/Icons";

const ShareDialog = dynamic(() => import("./ShareDialog"), { ssr: false });
export default function ShareButton({
  title = "",
  url,
  imageUrl,
  variant = "default",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const open = () => setIsOpen(true);
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);
  const isIcon = variant === "icon";
  const triggerClasses = isIcon
    ? `flex items-center justify-center w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 text-zinc-900 dark:text-white hover:scale-110 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 transition-all duration-300 ${className}`
    : `w-full flex items-center justify-center gap-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.99] transition-all ${className}`;
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={isIcon ? `Share ${title || "photo"}` : undefined}
        className={triggerClasses}
      >
        <Icons.Share className={isIcon ? "w-5 h-5" : "w-4 h-4"} />
        {!isIcon && <span>Share</span>}
      </button>

      {isOpen && (
        <ShareDialog
          title={title}
          url={url}
          imageUrl={imageUrl}
          onClose={close}
        />
      )}
    </>
  );
}
