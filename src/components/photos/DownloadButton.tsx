"use client";
import { AlertCircle, Check, Download, Loader2 } from "lucide-react";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { getDownloadUrlAction } from "@/actions/download";
import { buildCloudinaryUrl } from "@/lib/cloudinary/cloudinaryUtils";
export interface DownloadButtonProps {
  photoId: string | number;
  cloudinaryUrl: string;
  downloadCount?: number;
  variant?: "default" | "compact" | "primary";
  className?: string;
  fileName?: string;
}
type DownloadStatus = "idle" | "downloading" | "success" | "error";
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount = 0,
  variant = "default",
  className,
  fileName,
}: DownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    downloadCount,
    (current: number) => current + 1,
  );
  const [, startTransition] = useTransition();
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);
  const transitionToTemporaryStatus = (next: "success" | "error") => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setStatus(next);
    resetTimerRef.current = setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = null;
    }, 2400);
  };
  const handleDownload = () => {
    if (status === "downloading") return;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setStatus("downloading");
    const targetFileName = fileName || `momented-${photoId}.jpg`;
    startTransition(async () => {
      setOptimisticCount(1);
      try {
        const res = await getDownloadUrlAction({
          photoId,
          cloudinaryUrl,
          fileName: targetFileName,
        });
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.download = targetFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        transitionToTemporaryStatus("success");
      } catch {
        try {
          const fallbackUrl = buildCloudinaryUrl(cloudinaryUrl, [
            "fl_attachment",
          ]);
          const link = document.createElement("a");
          link.href = fallbackUrl;
          link.download = targetFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          transitionToTemporaryStatus("success");
        } catch {
          transitionToTemporaryStatus("error");
        }
      }
    });
  };
  const isDownloading = status === "downloading";
  const isSuccess = status === "success";
  const isError = status === "error";
  if (variant === "compact")
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={
          isSuccess
            ? "Photograph saved"
            : isError
              ? "Download failed"
              : isDownloading
                ? "Downloading photograph"
                : "Download photograph"
        }
        title={isSuccess ? "Saved" : isError ? "Failed" : "Download"}
        className={
          className ||
          `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-100 active:scale-98 ${
            isSuccess
              ? "border-ink bg-soft text-ink"
              : isError
                ? "border-danger/60 bg-danger/10 text-danger"
                : "border-line/80 bg-surface/80 backdrop-blur-xs text-ink hover:bg-soft disabled:opacity-70"
          }`
        }
      >
        {isDownloading ? (
          <Loader2
            size={13}
            aria-hidden="true"
            className="shrink-0 animate-spin text-ink"
          />
        ) : isSuccess ? (
          <Check
            size={13}
            aria-hidden="true"
            className="shrink-0 text-ink animate-in zoom-in-75 duration-200"
          />
        ) : isError ? (
          <AlertCircle
            size={13}
            aria-hidden="true"
            className="shrink-0 text-danger"
          />
        ) : (
          <Download size={13} aria-hidden="true" className="shrink-0" />
        )}
        <span className="hidden sm:inline">
          {isDownloading
            ? "Downloading…"
            : isSuccess
              ? "Saved"
              : isError
                ? "Failed"
                : "Download"}
        </span>
      </button>
    );
  if (variant === "primary")
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-live="polite"
        className={
          className ||
          `inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all duration-100 active:scale-98 disabled:opacity-70 cursor-pointer ${
            isError
              ? "bg-danger text-white hover:bg-danger/90"
              : "bg-solid text-on-solid hover:opacity-90"
          }`
        }
      >
        <span className="inline-flex min-w-0 items-center gap-2.5 whitespace-nowrap">
          {isDownloading ? (
            <Loader2
              size={15}
              aria-hidden="true"
              className="shrink-0 animate-spin text-on-solid"
            />
          ) : isSuccess ? (
            <Check
              size={15}
              aria-hidden="true"
              className="shrink-0 text-on-solid animate-in zoom-in-75 duration-200"
            />
          ) : isError ? (
            <AlertCircle
              size={15}
              aria-hidden="true"
              className="shrink-0 text-on-solid"
            />
          ) : (
            <Download size={15} aria-hidden="true" className="shrink-0" />
          )}
          <span>
            {isDownloading
              ? "Preparing"
              : isSuccess
                ? "Saved"
                : isError
                  ? "Failed"
                  : "High-Res"}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[12px] font-mono tabular-nums text-on-solid/70 font-medium"
        >
          {optimisticCount}
        </span>
      </button>
    );
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-live="polite"
      className={
        className ||
        `inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-full border px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-100 active:scale-98 cursor-pointer ${
          isSuccess
            ? "border-ink bg-soft text-ink font-semibold"
            : isError
              ? "border-danger bg-danger/10 text-danger font-semibold"
              : "border-line bg-surface text-ink hover:bg-soft hover:border-ink/20 disabled:opacity-70"
        }`
      }
    >
      <span className="inline-flex min-w-0 items-center gap-2.5 whitespace-nowrap">
        {isDownloading ? (
          <Loader2
            size={15}
            aria-hidden="true"
            className="shrink-0 animate-spin text-ink"
          />
        ) : isSuccess ? (
          <Check
            size={15}
            aria-hidden="true"
            className="shrink-0 text-ink animate-in zoom-in-75 duration-200"
          />
        ) : isError ? (
          <AlertCircle
            size={15}
            aria-hidden="true"
            className="shrink-0 text-danger"
          />
        ) : (
          <Download size={15} aria-hidden="true" className="shrink-0" />
        )}
        <span>
          {isDownloading
            ? "Preparing"
            : isSuccess
              ? "Saved"
              : isError
                ? "Failed"
                : "High-Res"}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-[12px] font-mono tabular-nums text-faint"
      >
        {optimisticCount}
      </span>
    </button>
  );
}
