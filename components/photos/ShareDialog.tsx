"use client";
import { Check, Copy, Share2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { incrementShare } from "@/actions/download";
import { copyText, imageUrlToFile } from "@/lib/utils/share";
export interface ShareDialogProps {
  title?: string;
  photoId?: string | number;
  url?: string;
  imageUrl?: string;
  onClose: () => void;
  onShareSuccess?: (count?: number) => void;
}
export default function ShareDialog({
  title = "",
  photoId,
  url,
  imageUrl,
  onClose,
  onShareSuccess,
}: ShareDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusablesRef = useRef<HTMLElement[] | null>(null);
  const shareFileRef = useRef<File | null | undefined>(undefined);
  const sharePromiseRef = useRef<Promise<File | null> | null>(null);
  const hasTrackedRef = useRef(false);
  const shareUrl = (() => {
    if (typeof window === "undefined") return url || "";
    return new URL(url || window.location.href, window.location.origin).href;
  })();
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
    const newFocusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
    focusablesRef.current = newFocusables;
  }, []);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && focusablesRef.current?.length) {
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
  const trackShare = useCallback(async () => {
    if (!photoId || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    try {
      const updatedCount = await incrementShare(photoId);
      onShareSuccess?.(updatedCount);
      router.refresh();
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  }, [photoId, onShareSuccess, router]);
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
      await trackShare();
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
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close share dialog"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/50 animate-[dialog-backdrop-in_200ms_ease-out]"
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-2xl animate-[dialog-panel-in_240ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div className="min-w-0">
            <h3
              id="share-dialog-title"
              className="font-serif text-xl font-medium leading-snug text-ink"
            >
              Share this moment
            </h3>
            <p className="mt-1 text-sm text-muted">
              Send the photograph, or a link to it.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close share dialog"
            className="-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
          {supportsNativeShare && (
            <div>
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={isSharing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-solid px-5 py-3 text-sm font-medium text-on-solid transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                <Share2 size={16} aria-hidden="true" />
                {isSharing ? "Preparing…" : "Send the photograph"}
              </button>
              <p className="mt-2 text-center text-[13px] text-muted">
                Opens your phone&apos;s share sheet with a preview image.
              </p>
            </div>
          )}
          <div>
            <label
              htmlFor="share-url"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Link
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-url"
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={copyLink}
                aria-live="polite"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-soft"
              >
                {copied ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} aria-hidden="true" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}