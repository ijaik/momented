"use client";
import { Download } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { incrementDownload } from "@/actions/download";

interface DownloadButtonProps {
  photoId: string | number;
  cloudinaryUrl: string;
  downloadCount: number;
}
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount,
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
    try {
      const response = await fetch(cloudinaryUrl);
      if (!response.ok)
        throw new Error(`Download failed with status ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `momented-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.href = cloudinaryUrl;
      link.download = `momented-${photoId}.jpg`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex w-full items-center justify-between gap-3 rounded-md border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-soft disabled:opacity-60"
    >
      <span className="inline-flex items-center gap-2">
        <Download size={16} aria-hidden="true" />
        {isDownloading ? "Downloading…" : "High resolution"}
      </span>
      <span aria-hidden="true" className="text-[13px] tabular-nums text-faint">
        {optimisticCount}
      </span>
    </button>
  );
}
