"use client";
import { useState } from "react";
import { incrementDownload } from "@/app/actions/download";
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  initialCount,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(initialCount || 0);
  async function handleDownload() {
    setIsDownloading(true);
    try {
      const newCount = await incrementDownload(photoId);
      setDownloadCount(newCount);
      const downloadUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/fl_attachment/",
      );
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "true");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  }
  return (
    <div className="mt-8 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {isDownloading ? "Downloading..." : "Download High-Res"}
      </button>
      <div className="text-zinc-500 dark:text-zinc-400 text-sm text-center font-medium">
        {downloadCount} {downloadCount === 1 ? "Download" : "Downloads"}
      </div>
    </div>
  );
}
