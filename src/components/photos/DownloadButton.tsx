"use client";
import { Download } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { incrementDownload } from "@/actions/download";
export interface DownloadButtonProps {
  photoId: string | number;
  cloudinaryUrl: string;
  downloadCount?: number;
  variant?: "default" | "compact";
  className?: string;
  fileName?: string;
}
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount = 0,
  variant = "default",
  className,
  fileName,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [, startTransition] = useTransition();
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    downloadCount,
    (current, increment: number) => current + increment,
  );
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    startTransition(async () => {
      setOptimisticCount(1);
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
    } catch {
      const link = document.createElement("a");
      link.href = cloudinaryUrl;
      link.download = targetFileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label="Download photograph"
        title="Download"
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-soft disabled:opacity-60"
        }
      >
        <Download size={14} aria-hidden="true" className="shrink-0" />
        <span className="hidden sm:inline">
          {isDownloading ? "Downloading…" : "Download"}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={
        className ||
        "inline-flex h-11 w-full items-center justify-between gap-2.5 rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-soft disabled:opacity-60 sm:px-5"
      }
    >
      <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap">
        <Download size={16} aria-hidden="true" className="shrink-0" />
        {isDownloading ? "Downloading…" : "High resolution"}
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-[13px] tabular-nums text-faint"
      >
        {optimisticCount}
      </span>
    </button>
  );
}
