"use client";
import {
  Battery,
  Camera,
  Eye,
  EyeOff,
  Flashlight,
  Lock,
  Monitor,
  Smartphone,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import DownloadButton from "@/components/photos/DownloadButton";
import type { Photo } from "@/types";
export interface WallpaperPreviewDialogProps {
  photo: Photo;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}
type DeviceMode = "mobile" | "desktop";
export default function WallpaperPreviewDialog({
  photo,
  fileName,
  isOpen,
  onClose,
}: WallpaperPreviewDialogProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [showUiOverlay, setShowUiOverlay] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    onClose();
  }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);
  if (!isOpen) return null;
  const title = photo.title || "Untitled Momented";
  const alt = `Wallpaper preview for ${title}`;
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview "${title}" as wallpaper`}
      className="fixed inset-0 z-100 flex flex-col justify-between overflow-hidden bg-black/80 backdrop-blur-xl p-4 sm:p-6 animate-[dialog-backdrop-in_200ms_cubic-bezier(0.16,1,0.3,1)] select-none"
    >
      <header className="relative z-30 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <h2 className="font-serif text-wrap text-lg font-medium tracking-tight text-white sm:text-xl truncate">
            Preview as Wallpaper
          </h2>
          <p className="hidden text-xs text-white/60 sm:block">{title}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex rounded-xl border border-white/15 bg-white/10 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              aria-pressed={deviceMode === "mobile"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                deviceMode === "mobile"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Smartphone size={13} aria-hidden="true" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              aria-pressed={deviceMode === "desktop"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                deviceMode === "desktop"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Monitor size={13} aria-hidden="true" />
              <span>Desktop</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowUiOverlay((prev) => !prev)}
            aria-label={
              showUiOverlay ? "Hide system UI mock" : "Show system UI mock"
            }
            title={showUiOverlay ? "Hide UI" : "Show UI"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95"
          >
            {showUiOverlay ? (
              <EyeOff size={13} aria-hidden="true" />
            ) : (
              <Eye size={13} aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {showUiOverlay ? "Hide UI" : "Show UI"}
            </span>
          </button>
          <div className="hidden sm:block">
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              cloudinaryPublicId={photo.cloudinary_public_id}
              downloadCount={photo.downloads || 0}
              fileName={fileName}
              variant="compact"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-white/25 active:scale-95"
            />
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close wallpaper preview (Esc)"
            title="Close (Esc)"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="relative my-auto flex h-[calc(100vh-160px)] w-full items-center justify-center overflow-hidden p-2 sm:p-4">
        {deviceMode === "mobile" ? (
          <div className="relative flex flex-col items-center justify-center transition-transform duration-300 ease-out animate-[dialog-panel-in_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <div
              className="relative aspect-9/19.5 w-65 sm:w-72.5 md:w-77.5 overflow-hidden rounded-[2.8rem] border-[9px] border-neutral-900 bg-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.12)] select-none"
              style={{ maxHeight: "min(68vh, 580px)" }}
            >
              <Image
                src={photo.cloudinary_url}
                alt={alt}
                fill
                sizes="(max-width: 640px) 260px, 310px"
                className="object-cover pointer-events-none select-none transition-transform duration-500 ease-out"
                priority
              />
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-5 w-24 rounded-full bg-black shadow-xs flex items-center justify-between px-2.5">
                <div className="h-2 w-2 rounded-full bg-neutral-900" />
                <div className="h-2 w-2 rounded-full bg-neutral-800/80" />
              </div>
              <div className="absolute top-3 left-6 right-6 z-20 flex justify-between items-center text-[10px] font-semibold text-white/90 tracking-tight">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi size={11} aria-hidden="true" />
                  <Battery size={13} aria-hidden="true" />
                </div>
              </div>
              {showUiOverlay && (
                <div className="absolute top-16 inset-x-0 z-20 flex flex-col items-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                  <Lock
                    size={12}
                    className="opacity-80 mb-1"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] font-medium tracking-wide uppercase opacity-90">
                    Saturday, October 31
                  </p>
                  <p className="font-serif text-5xl font-light tracking-tight mt-0.5">
                    9:41
                  </p>
                </div>
              )}
              <div className="absolute bottom-3 inset-x-4 z-20 flex flex-col items-center gap-3">
                {showUiOverlay && (
                  <div className="flex w-full justify-between px-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10 shadow-sm">
                      <Flashlight size={14} aria-hidden="true" />
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10 shadow-sm">
                      <Camera size={14} aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div className="h-1 w-28 rounded-full bg-white/80 shadow-xs" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center w-full max-w-2xl transition-transform duration-300 ease-out animate-[dialog-panel-in_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <div
              className="relative aspect-16/10 w-full overflow-hidden rounded-t-2xl border-8 sm:border-10 border-neutral-900 bg-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.12)] select-none"
              style={{ maxHeight: "min(52vh, 440px)" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 h-3.5 w-16 rounded-b-md bg-neutral-900 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-950 border border-neutral-800" />
              </div>
              <Image
                src={photo.cloudinary_url}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover pointer-events-none select-none transition-transform duration-500 ease-out"
                priority
              />
              {showUiOverlay && (
                <div className="absolute top-0 inset-x-0 z-20 h-5 bg-black/35 backdrop-blur-md flex items-center justify-between px-3 text-[10px] text-white/90 border-b border-white/10 select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold tracking-tight">
                      Momented
                    </span>
                    <span className="opacity-75 hidden sm:inline">File</span>
                    <span className="opacity-75 hidden sm:inline">Edit</span>
                    <span className="opacity-75 hidden sm:inline">View</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] opacity-85">
                    <span>Sat Oct 31</span>
                    <span>9:41 AM</span>
                    <Wifi size={10} aria-hidden="true" />
                    <Battery size={11} aria-hidden="true" />
                  </div>
                </div>
              )}
              {showUiOverlay && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/25 px-3 py-1.5 shadow-lg">
                  <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-blue-600 to-cyan-400 shadow-xs flex items-center justify-center text-white text-[9px] font-semibold">
                    Finder
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-amber-500 to-rose-500 shadow-xs flex items-center justify-center text-white">
                    <Sparkles size={13} aria-hidden="true" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-emerald-500 to-teal-400 shadow-xs flex items-center justify-center text-white">
                    <Camera size={13} aria-hidden="true" />
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-violet-600 to-indigo-400 shadow-xs flex items-center justify-center text-white">
                    <Monitor size={13} aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
            <div className="relative h-3 sm:h-4 w-[104%] rounded-b-xl bg-neutral-800 border-t border-neutral-700 shadow-md flex items-center justify-center">
              <div className="h-0.5 w-12 rounded-full bg-neutral-900" />
            </div>
          </div>
        )}
      </div>
      <footer className="relative z-30 mx-auto flex w-full max-w-5xl items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
        <span>
          Toggle between mobile and desktop mock frames to preview framing.
        </span>
        <span className="font-mono text-[11px] text-white/50">
          {photo.width && photo.height
            ? `${photo.width} × ${photo.height}px`
            : "Original Frame"}
        </span>
      </footer>
    </div>
  );
}
