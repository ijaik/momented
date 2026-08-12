"use client";
import { useState } from "react";
import { incrementDownload } from "@/app/actions/download";
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
      className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 px-6 py-3.5 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors disabled:opacity-50"
    >
      <div className="flex items-center gap-2.5">
        <Icons.Download className="w-5 h-5" />
        <span>{isDownloading ? "Downloading..." : "High-Res"}</span>
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
        {count}
      </span>
    </button>
  );
}
