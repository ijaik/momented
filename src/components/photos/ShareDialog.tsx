"use client";
import { Check, Copy, Share2, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { incrementShare } from "@/actions/download";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { useNativeDialog } from "@/lib/hooks/useNativeDialog";
import { imageUrlToFile } from "@/lib/utils/share";
export interface ShareDialogProps {
  title?: string;
  photoId?: string;
  url?: string;
  imageUrl?: string;
  onClose: () => void;
  onTrackShare?: () => void | Promise<void>;
}
type ActionStatus =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "error"; message: string };
type FileCacheState =
  | { status: "idle" }
  | { status: "loading"; url: string; promise: Promise<File | null> }
  | { status: "ready"; url: string; file: File }
  | { status: "failed"; url: string };
function isOutsideDialogBounds(
  e: React.PointerEvent<HTMLDialogElement>,
  dialog: HTMLDialogElement,
): boolean {
  const r = dialog.getBoundingClientRect();
  return (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  );
}
export default function ShareDialog({
  title = "",
  photoId,
  url,
  imageUrl,
  onClose,
  onTrackShare,
}: ShareDialogProps) {
  const [actionStatus, setActionStatus] = useState<ActionStatus>({
    status: "idle",
  });
  const { copied, copy, reset: resetCopy } = useCopyToClipboard();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);
  const fileCacheRef = useRef<FileCacheState>({ status: "idle" });
  const hasTrackedRef = useRef(false);
  const titleId = useId();
  const shareInputId = useId();
  useNativeDialog(dialogRef);
  const shareUrl = (() => {
    if (typeof window === "undefined") return url || "";
    return new URL(url || window.location.href, window.location.origin).href;
  })();
  const shareText = title
    ? `Check out "${title}" on Momented.`
    : "Check out Momented.";
  const supportsNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const close = () => {
    resetCopy();
    setActionStatus({ status: "idle" });
    onClose();
  };
  const trackShare = useCallback(async () => {
    if (!photoId || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    try {
      if (onTrackShare) {
        await onTrackShare();
      } else {
        await incrementShare(photoId);
      }
    } catch (err) {
      console.error("Failed to track share:", err);
    }
  }, [photoId, onTrackShare]);
  const getShareFile = useCallback(async (): Promise<File | null> => {
    if (!imageUrl) return null;
    const current = fileCacheRef.current;
    if (current.status === "ready" && current.url === imageUrl)
      return current.file;
    if (current.status === "loading" && current.url === imageUrl)
      return current.promise;
    const promise = (async () => {
      try {
        const file = await imageUrlToFile(imageUrl);
        if (file) {
          fileCacheRef.current = { status: "ready", url: imageUrl, file };
          return file;
        }
        fileCacheRef.current = { status: "failed", url: imageUrl };
        return null;
      } catch {
        fileCacheRef.current = { status: "failed", url: imageUrl };
        return null;
      }
    })();
    fileCacheRef.current = { status: "loading", url: imageUrl, promise };
    return promise;
  }, [imageUrl]);
  useEffect(() => {
    if (imageUrl && supportsNativeShare) {
      getShareFile().catch((err) => {
        console.warn("Pre-fetch for share file failed:", err);
      });
    }
  }, [imageUrl, supportsNativeShare, getShareFile]);
  async function copyLink() {
    const ok = await copy(shareUrl);
    if (!ok) {
      setActionStatus({
        status: "error",
        message: "Couldn't copy the link — please try again.",
      });
    } else if (actionStatus.status === "error") {
      setActionStatus({ status: "idle" });
    }
  }
  async function handleNativeShare() {
    setActionStatus({ status: "sharing" });
    let shared = false;
    try {
      const file = await getShareFile();
      const shareMessage = `${shareText}\n\nView photograph on Momented: ${shareUrl}`;
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
              setActionStatus({
                status: "error",
                message: "Couldn't share right now — copy the link instead.",
              });
              return;
            }
          }
        }
      }
    } catch {
      setActionStatus({
        status: "error",
        message: "Couldn't prepare the photo — copy the link instead.",
      });
      return;
    } finally {
      if (shared) {
        await trackShare();
        close();
      } else
        setActionStatus((prev) =>
          prev.status === "sharing" ? { status: "idle" } : prev,
        );
    }
  }
  const isSharing = actionStatus.status === "sharing";
  const error = actionStatus.status === "error" ? actionStatus.message : null;
  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, unknown>)}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onPointerDown={(e) => {
        if ("closedBy" in HTMLDialogElement.prototype) return;
        const dialog = dialogRef.current;
        pressedOutsideRef.current = Boolean(
          dialog && isOutsideDialogBounds(e, dialog),
        );
      }}
      onPointerUp={(e) => {
        if ("closedBy" in HTMLDialogElement.prototype) return;
        const dialog = dialogRef.current;
        if (
          pressedOutsideRef.current &&
          dialog &&
          isOutsideDialogBounds(e, dialog)
        ) {
          close();
        }
        pressedOutsideRef.current = false;
      }}
      className="fixed inset-0 z-100 m-auto max-w-md w-full overflow-hidden rounded-2xl border border-line/70 bg-surface/90 backdrop-blur-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.18)] p-0 outline-hidden overscroll-contain backdrop:bg-ink/35 backdrop:backdrop-blur-xs animate-[dialog-panel-in_240ms_cubic-bezier(0.16,1,0.3,1)] [&:not([open])]:hidden"
    >
      <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
        <div className="min-w-0">
          <h3
            id={titleId}
            className="font-serif text-xl leading-snug tracking-tight text-ink"
          >
            Share this moment
          </h3>
          <p className="mt-1 text-sm text-muted">
            Send the photograph, or a link to it.
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close share dialog"
          className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft/60 text-muted transition-all hover:bg-soft hover:text-ink active:scale-98 cursor-pointer"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        {supportsNativeShare && (
          <div>
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isSharing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-solid px-5 py-3 text-sm font-medium text-on-solid shadow-xs transition-all hover:opacity-90 active:scale-98 disabled:opacity-60 cursor-pointer"
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
            htmlFor={shareInputId}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Link
          </label>
          <div className="flex items-center gap-2">
            <input
              id={shareInputId}
              name="share-url"
              type="text"
              readOnly
              value={shareUrl}
              className="min-w-0 flex-1 rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 text-sm text-ink backdrop-blur-xs transition-colors focus:border-ink/40 focus:outline-hidden"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copyLink}
              aria-live="polite"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line/80 bg-surface/80 backdrop-blur-xs px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-soft active:scale-98 cursor-pointer"
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
            className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger"
          >
            {error}
          </p>
        )}
      </div>
    </dialog>
  );
}
