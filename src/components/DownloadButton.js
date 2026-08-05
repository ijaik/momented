"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { incrementDownload } from "@/app/actions/download";
import { Icons } from "@/components/ui/Icons";
import { getAttachmentDownloadUrl } from "@/lib/cloudinaryUtils";
export default function DownloadButton({
  photoId,
  cloudinaryUrl,
  downloadCount = 0,
}) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  async function handleDownload() {
    setIsDownloading(true);
    try {
      await incrementDownload(photoId);
      router.refresh();
      const downloadUrl = getAttachmentDownloadUrl(cloudinaryUrl);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 px-6 py-3.5 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors disabled:opacity-50"
    >
      <div className="flex items-center gap-2.5">
        <Icons.Download className="w-5 h-5" />
        <span>{isDownloading ? "Downloading..." : "High-Res"}</span>
      </div>
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
        {downloadCount}
      </span>
    </button>
  );
}
