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
      const updatedCount = await incrementDownload(String(photoId));
      setCount(updatedCount);
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
      className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
    >
      <span className="inline-flex items-center gap-2.5">
        <Icons.Download className="w-4 h-4" />
        {isDownloading ? "Downloading..." : "Download Original"}
      </span>
      <span className="text-xs font-mono opacity-80 bg-zinc-800 dark:bg-zinc-200 px-2.5 py-1 rounded-md">
        {count}
      </span>
    </button>
  );
}
