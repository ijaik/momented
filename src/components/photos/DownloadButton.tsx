"use client";
import { Check, Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { incrementDownload } from "@/actions/download";
export interface DownloadButtonProps {
  photoId: string | number;
  cloudinaryUrl: string;
  downloadCount?: number;
  variant?: "default" | "compact";
  className?: string;
  fileName?: string;
}
type DownloadStatus = "idle" | "downloading" | "success";
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount = 0,
  variant = "default",
  className,
  fileName,
}: DownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [, startTransition] = useTransition();
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);
  const handleDownload = async () => {
    if (status === "downloading") return;
    setStatus("downloading");
    startTransition(async () => {
      try {
        await incrementDownload(String(photoId));
      } catch (countError) {
        console.warn("Failed to record download count:", countError);
      }
    });
    const targetFileName = fileName || `momented-${photoId}.jpg`;
    try {
      const response = await fetch(cloudinaryUrl);
      if (!response.ok)
        throw new Error(`Download failed with status ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus("success");
      resetTimerRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2400);
    } catch {
      const link = document.createElement("a");
      link.href = cloudinaryUrl;
      link.download = targetFileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus("success");
      resetTimerRef.current = setTimeout(() => {
        setStatus("idle");
      }, 2400);
    }
  };
  const isDownloading = status === "downloading";
  const isSuccess = status === "success";
  if (variant === "compact")
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={
          isSuccess
            ? "Photograph saved"
            : isDownloading
              ? "Downloading photograph"
              : "Download photograph"
        }
        title={isSuccess ? "Saved" : "Download"}
        className={
          className ||
          `inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
            isSuccess
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
              : "border-line bg-surface text-ink hover:bg-soft disabled:opacity-70"
          }`
        }
      >
        {isDownloading ? (
          <Loader2
            size={13}
            aria-hidden="true"
            className="shrink-0 animate-spin text-signal"
          />
        ) : isSuccess ? (
          <Check
            size={13}
            aria-hidden="true"
            className="shrink-0 text-emerald-500 animate-in zoom-in-75 duration-200"
          />
        ) : (
          <Download size={13} aria-hidden="true" className="shrink-0" />
        )}
        <span className="hidden sm:inline">
          {isDownloading ? "Downloading…" : isSuccess ? "Saved" : "Download"}
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
        `inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-md border px-4 py-2 text-sm font-medium transition-all sm:px-5 ${
          isSuccess
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            : "border-line bg-surface text-ink hover:bg-soft hover:border-ink/20 disabled:opacity-70"
        }`
      }
    >
      <span className="inline-flex min-w-0 items-center gap-2.5 whitespace-nowrap">
        {isDownloading ? (
          <Loader2
            size={15}
            aria-hidden="true"
            className="shrink-0 animate-spin text-signal"
          />
        ) : isSuccess ? (
          <Check
            size={15}
            aria-hidden="true"
            className="shrink-0 text-emerald-500 animate-in zoom-in-75 duration-200"
          />
        ) : (
          <Download size={15} aria-hidden="true" className="shrink-0" />
        )}
        <span>
          {isDownloading ? "Preparing" : isSuccess ? "Saved" : "High-Res"}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`shrink-0 text-[12px] font-mono tabular-nums transition-colors ${
          isSuccess ? "text-emerald-500" : "text-faint"
        }`}
      >
        {isSuccess ? "Ready" : `${downloadCount + (isSuccess ? 1 : 0)}`}
      </span>
    </button>
  );
}
