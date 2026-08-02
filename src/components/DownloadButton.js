"use client";
import { useState } from "react";
import { incrementDownload } from "@/app/actions/download";
export default function DownloadButton({ photoId, cloudinaryUrl }) {
  const [isDownloading, setIsDownloading] = useState(false);
  async function handleDownload() {
    setIsDownloading(true);
    try {
      await incrementDownload(photoId);
      const downloadUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/fl_attachment/",
      );
      window.location.assign(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
    >
      {isDownloading ? "Downloading..." : "Download High-Res"}
    </button>
  );
}
