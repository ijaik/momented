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
export interface DownloadButtonProps {
  photoId: string;
  cloudinaryUrl: string;
  downloadCount?: number;
  variant?: "default" | "compact" | "primary";
  className?: string;
  fileName?: string;
}
type DownloadStatus = "idle" | "downloading" | "success" | "error";
const COMPACT_LABELS: Record<DownloadStatus, string> = {
  idle: "Download",
  downloading: "Downloading…",
  success: "Saved",
  error: "Failed",
};
const FULL_LABELS: Record<DownloadStatus, string> = {
  idle: "High-Res",
  downloading: "Preparing",
  success: "Saved",
  error: "Failed",
};
function DownloadStatusIcon({
  status,
  size,
  colorClass,
}: {
  status: DownloadStatus;
  size: number;
  colorClass: string;
}) {
  switch (status) {
    case "downloading":
      return (
        <Loader2
          size={size}
          aria-hidden="true"
          className={`shrink-0 animate-spin ${colorClass}`}
        />
      );
    case "success":
      return (
        <Check
          size={size}
          aria-hidden="true"
          className={`shrink-0 ${colorClass}`}
        />
      );
    case "error":
      return (
        <AlertCircle
          size={size}
          aria-hidden="true"
          className={`shrink-0 ${colorClass}`}
        />
      );
    case "idle":
      return <Download size={size} aria-hidden="true" className="shrink-0" />;
  }
}
function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount = 0,
  variant = "default",
  className,
  fileName,
}: DownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [confirmed, setConfirmed] = useState<{
    photoId: string;
    count: number;
  } | null>(null);
  const baseCount =
    confirmed?.photoId === photoId
      ? Math.max(downloadCount, confirmed.count)
      : downloadCount;
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    baseCount,
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
        if (typeof res.downloadCount === "number") {
          setConfirmed({ photoId, count: res.downloadCount });
        }
        triggerDownload(res.downloadUrl, targetFileName);
        transitionToTemporaryStatus("success");
      } catch {
        transitionToTemporaryStatus("error");
      }
    });
  };
  const isDownloading = status === "downloading";
  const isSuccess = status === "success";
  const isError = status === "error";
  if (variant === "compact") {
    const compactStyle = isSuccess
      ? "border-ink bg-soft text-ink"
      : isError
        ? "border-danger/60 bg-danger/10 text-danger"
        : "border-line/80 bg-surface/80 backdrop-blur-xs text-ink hover:bg-soft disabled:opacity-70";
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
          `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-100 active:scale-98 ${compactStyle}`
        }
      >
        <DownloadStatusIcon
          status={status}
          size={13}
          colorClass={isError ? "text-danger" : "text-ink"}
        />
        <span className="hidden sm:inline">{COMPACT_LABELS[status]}</span>
      </button>
    );
  }
  const isPrimary = variant === "primary";
  const buttonStyle = isPrimary
    ? `inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all duration-100 active:scale-98 disabled:opacity-70 cursor-pointer ${
        isError
          ? "bg-danger text-white hover:bg-danger/90"
          : "bg-solid text-on-solid hover:opacity-90"
      }`
    : `inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-full border px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-100 active:scale-98 cursor-pointer ${
        isSuccess
          ? "border-ink bg-soft text-ink font-semibold"
          : isError
            ? "border-danger bg-danger/10 text-danger font-semibold"
            : "border-line bg-surface text-ink hover:bg-soft hover:border-ink/20 disabled:opacity-70"
      }`;
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-live="polite"
      className={className || buttonStyle}
    >
      <span className="inline-flex min-w-0 items-center gap-2.5 whitespace-nowrap">
        <DownloadStatusIcon
          status={status}
          size={15}
          colorClass={
            isPrimary ? "text-on-solid" : isError ? "text-danger" : "text-ink"
          }
        />
        <span>{FULL_LABELS[status]}</span>
      </span>
      <span
        aria-hidden="true"
        className={`shrink-0 text-[12px] font-mono tabular-nums ${
          isPrimary ? "text-on-solid/70 font-medium" : "text-faint"
        }`}
      >
        {optimisticCount}
      </span>
    </button>
  );
}
