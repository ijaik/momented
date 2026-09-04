"use client";
import { useState } from "react";
import { incrementDownload } from "@/actions/download";
import { Icons } from "@/components/ui/Icons";

interface DownloadButtonProps {
  photoId: string | number;
  cloudinaryUrl: string;
  downloadCount: number;
}
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount: initialCount,
}: DownloadButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      try {
        const updatedCount = await incrementDownload(String(photoId));
        setCount(updatedCount);
      } catch (countError) {
        console.warn("Failed to record download count:", countError);
      }
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
    } catch (error) {
      console.error("Download failed:", error);
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
        <Icons.Download className="h-4 w-4" />
        {isDownloading ? "Downloading…" : "High resolution"}
      </span>
      <span aria-hidden="true" className="text-[13px] tabular-nums text-faint">
        {count}
      </span>
    </button>
  );
}
