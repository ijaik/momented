"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { copyText, imageUrlToFile } from "@/lib/share";
import { supabase } from "@/lib/supabase";
export interface ShareDialogProps {
  title?: string;
  photoId?: string | number;
  url?: string;
  imageUrl?: string;
  onClose: () => void;
}
export default function ShareDialog({
  title = "",
  photoId,
  url,
  imageUrl,
  onClose,
}: ShareDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusablesRef = useRef<HTMLElement[]>([]);
  const shareFileRef = useRef<File | null | undefined>(undefined);
  const sharePromiseRef = useRef<Promise<File | null> | null>(null);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return url || "";
    return new URL(url || window.location.href, window.location.origin).href;
  }, [url]);
  const shareText = title
    ? `Check out "${title}" on Momented\n\nVisit the link for full resolution & downloads.`
    : "Check out Momented\n\nVisit the link for full resolution & downloads.";
  const supportsNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const close = useCallback(() => {
    onClose();
    setCopied(false);
    setError(null);
  }, [onClose]);
  useEffect(() => {
    if (!panelRef.current) return;
    focusablesRef.current = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && focusablesRef.current.length > 0) {
        const focusables = focusablesRef.current;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [close]);
  const trackShare = async () => {
    if (!photoId) return;
    try {
      const { error } = await supabase.rpc("increment_shares", {
        row_id: photoId,
      });
      if (error) console.error("Supabase share error:", error);
      else router.refresh();
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  };
  const getShareFile = useCallback(async (): Promise<File | null> => {
    if (!imageUrl) return null;
    if (shareFileRef.current !== undefined) return shareFileRef.current;
    if (sharePromiseRef.current) {
      return sharePromiseRef.current;
    }
    sharePromiseRef.current = (async () => {
      const file = await imageUrlToFile(imageUrl);
      if (file) shareFileRef.current = file;
      return shareFileRef.current ?? null;
    })();
    return sharePromiseRef.current;
  }, [imageUrl]);
  useEffect(() => {
    if (imageUrl && supportsNativeShare) {
      getShareFile().catch((err) => {
        console.warn("Pre-fetch for share file failed:", err);
      });
    }
  }, [imageUrl, supportsNativeShare, getShareFile]);
  async function copyLink() {
    try {
      await copyText(shareUrl);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the link — please try again.");
    }
  }
  async function handleNativeShare() {
    setIsSharing(true);
    setError(null);
    let shared = false;
    try {
      const file = await getShareFile();
      const shareMessage = `${shareText}\n\nView full high-resolution photo: ${shareUrl}`;
      const standardData = {
        title: title || "Momented",
        text: shareMessage,
        url: shareUrl,
      };
      try {
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ text: shareMessage, files: [file] });
        } else {
          await navigator.share(standardData);
        }
        shared = true;
      } catch (shareError: unknown) {
        if (
          typeof shareError === "object" &&
          shareError !== null &&
          "name" in shareError &&
          (shareError as { name: string }).name !== "AbortError"
        ) {
          try {
            await navigator.share(standardData);
            shared = true;
          } catch (fallbackError: unknown) {
            if (
              typeof fallbackError === "object" &&
              fallbackError !== null &&
              "name" in fallbackError &&
              (fallbackError as { name: string }).name !== "AbortError"
            ) {
              setError("Couldn't share right now — copy the link instead.");
            }
          }
        }
      }
    } catch {
      setError("Couldn't prepare the photo — copy the link instead.");
    } finally {
      setIsSharing(false);
      if (shared) {
        await trackShare();
        close();
      }
    }
  }
  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close share dialog"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm animate-[share-fade-in_200ms_ease-out]"
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-[share-pop-in_300ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        {imageUrl && (
          <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden rounded-t-3xl">
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="448px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/40 to-transparent" />
          </div>
        )}
        <div className="p-6 pt-5">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h3
                id="share-dialog-title"
                className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight line-clamp-2"
              >
                Share {title ? `"${title}"` : "this photo"}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Send the photo or a link — your choice.
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={close}
              aria-label="Close share dialog"
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
          {supportsNativeShare && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2.5 bg-black dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                <Icons.Share className="w-5 h-5" />
                {isSharing ? "Preparing…" : "Share the photo"}
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                Sends a quick preview image.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2">
            <Icons.Link className="w-4 h-4 shrink-0 text-zinc-400" />
            <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className={`shrink-0 flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors ${
                copied
                  ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
              }`}
            >
              {copied ? (
                <Icons.Copied className="w-4 h-4" />
              ) : (
                <Icons.Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2.5 animate-[share-fade-in_200ms_ease-out]">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
