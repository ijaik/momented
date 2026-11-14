"use client";
import { ChevronLeft, ChevronRight, Info, Maximize2 } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import DownloadButton from "@/components/photos/DownloadButton";
import ExifSpecGrid, { hasPhotoExif } from "@/components/photos/ExifSpecGrid";
import ShareButton from "@/components/photos/ShareButton";
import WallpaperPreviewButton from "@/components/photos/WallpaperPreviewButton";
import FullscreenDialog from "@/components/ui/FullscreenDialog";
import { siteConfig } from "@/config/site";
import { formatDownloadFilename } from "@/lib/cloudinary/cloudinaryUtils";
import { useFullscreenMaximize } from "@/lib/hooks/useFullscreenMaximize";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import type { SeriesSlidePhoto } from "@/types";

interface SeriesCarouselProps {
  seriesTitle: string;
  seriesDescription?: string | null;
  photos: SeriesSlidePhoto[];
  createdAt: string;
}
function rubberband(
  overshoot: number,
  dimension = 600,
  constant = 0.55,
): number {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}
export function calculateNextSlideIndex(
  deltaX: number,
  elapsed: number,
  currentIndex: number,
  totalSlides: number,
): number {
  const velocity = Math.abs(deltaX) / Math.max(1, elapsed);
  if (deltaX < 0 && currentIndex < totalSlides - 1) {
    if (deltaX < -40 || (deltaX < -20 && velocity > 0.25))
      return currentIndex + 1;
  } else if (deltaX > 0 && currentIndex > 0) {
    if (deltaX > 40 || (deltaX > 20 && velocity > 0.25))
      return currentIndex - 1;
  }
  return currentIndex;
}
type GesturePhase =
  | { status: "idle" }
  | {
      status: "detecting-touch";
      startX: number;
      startY: number;
      startTime: number;
    }
  | {
      status: "locked-vertical";
    }
  | {
      status: "dragging";
      source: "touch" | "mouse";
      startX: number;
      startTime: number;
      offset: number;
    };
export default function SeriesCarousel({
  seriesTitle,
  seriesDescription,
  photos,
  createdAt,
}: SeriesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gesture, setGesture] = useState<GesturePhase>({ status: "idle" });
  const gestureRef = useRef<GesturePhase>({ status: "idle" });
  const { isMaximized, toggleMaximize, exitMaximize } = useFullscreenMaximize();
  const [showExifDrawer, setShowExifDrawer] = useState(false);
  const totalSlides = photos.length;
  const dragContainerWidthRef = useRef(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxContainerRef = useRef<HTMLDivElement>(null);
  const updateGesture = useCallback((next: GesturePhase) => {
    gestureRef.current = next;
    setGesture(next);
  }, []);
  const isDragging = gesture.status === "dragging";
  const dragOffset = gesture.status === "dragging" ? gesture.offset : 0;
  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      setActiveIndex(clamped);
      updateGesture({ status: "idle" });
    },
    [totalSlides, updateGesture],
  );
  const prevMaximizedRef = useRef(isMaximized);
  useEffect(() => {
    if (prevMaximizedRef.current !== isMaximized) {
      prevMaximizedRef.current = isMaximized;
      updateGesture({ status: "idle" });
    }
  }, [isMaximized, updateGesture]);
  const onWindowKeyDown = useEffectEvent((e: globalThis.KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    )
      return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    }
  });
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onWindowKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const updateWidth = () => {
      const el = isMaximized ? maxContainerRef.current : containerRef.current;
      if (el) dragContainerWidthRef.current = el.clientWidth || 600;
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isMaximized]);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (totalSlides <= 1) return;
    const touch = e.touches[0];
    updateGesture({
      status: "detecting-touch",
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    });
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const current = gestureRef.current;
    if (current.status !== "detecting-touch" && current.status !== "dragging")
      return;
    const touch = e.touches[0];
    if (current.status === "detecting-touch") {
      const deltaX = touch.clientX - current.startX;
      const deltaY = touch.clientY - current.startY;
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          updateGesture({ status: "locked-vertical" });
          return;
        }
        const width = dragContainerWidthRef.current;
        let effectiveOffset = deltaX;
        if (
          (activeIndex === 0 && deltaX > 0) ||
          (activeIndex === totalSlides - 1 && deltaX < 0)
        )
          effectiveOffset = rubberband(deltaX, width);
        updateGesture({
          status: "dragging",
          source: "touch",
          startX: current.startX,
          startTime: current.startTime,
          offset: effectiveOffset,
        });
      }
      return;
    }
    if (current.status === "dragging" && current.source === "touch") {
      const deltaX = touch.clientX - current.startX;
      const width = dragContainerWidthRef.current;
      let effectiveOffset = deltaX;
      if (
        (activeIndex === 0 && deltaX > 0) ||
        (activeIndex === totalSlides - 1 && deltaX < 0)
      )
        effectiveOffset = rubberband(deltaX, width);
      updateGesture({
        ...current,
        offset: effectiveOffset,
      });
    }
  };
  const handleTouchEnd = () => {
    const current = gestureRef.current;
    if (current.status === "dragging" && current.source === "touch") {
      const deltaX = current.offset;
      const elapsed = Date.now() - current.startTime;
      const nextIdx = calculateNextSlideIndex(
        deltaX,
        elapsed,
        activeIndex,
        totalSlides,
      );
      goToSlide(nextIdx);
    } else updateGesture({ status: "idle" });
  };
  const handleTouchCancel = () => {
    updateGesture({ status: "idle" });
  };
  const handleMouseMove = useEffectEvent((e: MouseEvent) => {
    const current = gestureRef.current;
    if (
      current.status !== "dragging" ||
      current.source !== "mouse" ||
      totalSlides <= 1
    )
      return;
    const deltaX = e.clientX - current.startX;
    let dampenedOffset = deltaX;
    const containerWidth = dragContainerWidthRef.current;
    if (activeIndex === 0 && deltaX > 0)
      dampenedOffset = rubberband(deltaX, containerWidth);
    else if (activeIndex === totalSlides - 1 && deltaX < 0)
      dampenedOffset = rubberband(deltaX, containerWidth);
    updateGesture({
      ...current,
      offset: dampenedOffset,
    });
  });
  const handleMouseUp = useEffectEvent(() => {
    const current = gestureRef.current;
    if (current.status !== "dragging" || current.source !== "mouse") return;
    const deltaX = current.offset;
    const elapsed = Math.max(1, Date.now() - current.startTime);
    const nextIndex = calculateNextSlideIndex(
      deltaX,
      elapsed,
      activeIndex,
      totalSlides,
    );
    if (nextIndex !== activeIndex) goToSlide(nextIndex);
    else updateGesture({ status: "idle" });
  });
  useEffect(() => {
    const container = isMaximized
      ? maxContainerRef.current
      : containerRef.current;
    if (!container || totalSlides <= 1) return;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragContainerWidthRef.current = container.clientWidth || 600;
      updateGesture({
        status: "dragging",
        source: "mouse",
        startX: e.clientX,
        startTime: Date.now(),
        offset: 0,
      });
    };
    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onMouseUp = () => handleMouseUp();
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [totalSlides, isMaximized, updateGesture]);
  const currentPhoto = photos[activeIndex] || photos[0];
  if (!currentPhoto) return null;
  const currentAspect =
    currentPhoto.width && currentPhoto.height
      ? currentPhoto.width / currentPhoto.height
      : 4 / 3;
  const currentAspectNum = Number(currentAspect.toFixed(4));
  const maxPixelWidth = Math.round(680 * currentAspect);
  const mobileMaxPixelWidth = Math.round(380 * currentAspectNum);
  const activeDisplayDate = formatDisplayDate(
    currentPhoto.created_at,
    currentPhoto.taken_at,
  );
  const slideDownloadFileName = formatDownloadFilename(
    currentPhoto.title || seriesTitle,
    `-frame-${activeIndex + 1}`,
  );
  return (
    <section
      aria-label={`${seriesTitle} photo carousel`}
      className="flex flex-col gap-6"
    >
      {/* Series Carousel Stage */}
      <div
        className="relative mx-auto w-full overflow-hidden rounded-xs transition-[max-width,aspect-ratio] duration-300 ease-out select-none touch-pan-y max-h-[min(48svh,380px)] sm:max-h-[min(76vh,680px)] max-w-(--w-mobile) sm:max-w-(--w-desktop)"
        style={
          {
            aspectRatio: `${currentAspect}`,
            "--w-mobile": `min(100%, calc(48svh * ${currentAspectNum}), ${mobileMaxPixelWidth}px)`,
            "--w-desktop": `min(100%, calc(76vh * ${currentAspectNum}), ${maxPixelWidth}px)`,
          } as React.CSSProperties
        }
      >
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="flex h-full w-full select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging
              ? "none"
              : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: isDragging ? "transform" : "auto",
          }}
        >
          {photos.map((photo, index) => {
            const slideTitle =
              photo.title || `Frame ${String(index + 1).padStart(2, "0")}`;
            const slideAlt = photo.description || photo.title || slideTitle;
            return (
              <div
                key={photo.id}
                className="relative flex h-full w-full flex-none items-center justify-center select-none"
              >
                <div className="relative h-full w-full pointer-events-none select-none">
                  <Image
                    src={photo.cloudinary_url}
                    alt={slideAlt}
                    fill
                    preload={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1080px"
                    className="object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Slide Navigation & Indicator Strip */}
      {totalSlides > 1 && (
        <div className="flex w-full items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-muted">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(totalSlides).padStart(2, "0")}
            </span>
            <nav
              aria-label="Slide indicators"
              className="flex items-center gap-0.5"
            >
              {photos.map((photo, idx) => (
                <button
                  key={`indicator-${photo.id}-${idx}`}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  className="group flex items-center py-3 px-1 cursor-pointer"
                >
                  <span
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-6 bg-ink"
                        : "w-1.5 bg-line group-hover:bg-muted"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photograph"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-2xs transition-colors hover:bg-soft active:scale-98 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              disabled={activeIndex === totalSlides - 1}
              aria-label="Next photograph"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-2xs transition-colors hover:bg-soft active:scale-98 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {/* Frame Information & Actions Toolbar */}
      <div className="flex w-full flex-col gap-4 border-t border-line/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-ink sm:text-2xl font-normal">
            {currentPhoto.title || `${seriesTitle} — Frame ${activeIndex + 1}`}
          </h2>
          {(currentPhoto.description || seriesDescription) && (
            <p className="mt-1 text-sm text-muted">
              {currentPhoto.description || seriesDescription}
            </p>
          )}
          <p className="mt-1 text-xs text-muted font-mono">
            {activeDisplayDate}
            {currentPhoto.camera_model &&
              ` · Shot on ${currentPhoto.camera_model}`}
            {` · by ${currentPhoto.artist || siteConfig.author.name}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExifDrawer((prev) => !prev)}
            aria-expanded={showExifDrawer}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-all active:scale-98 cursor-pointer ${
              showExifDrawer
                ? "border-ink bg-soft text-ink font-semibold"
                : "border-line bg-surface text-ink hover:bg-soft"
            }`}
          >
            <Info size={14} aria-hidden="true" />
            <span>{showExifDrawer ? "Hide details" : "Frame details"}</span>
          </button>
          <WallpaperPreviewButton
            photo={currentPhoto}
            fileName={slideDownloadFileName}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ink transition-all hover:bg-soft active:scale-98 cursor-pointer"
            variant="compact"
          />
          <DownloadButton
            photoId={currentPhoto.id}
            cloudinaryUrl={currentPhoto.cloudinary_url}
            fileName={slideDownloadFileName}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ink transition-all hover:bg-soft active:scale-98 disabled:opacity-60 cursor-pointer"
            variant="compact"
          />
          <ShareButton
            title={`${seriesTitle} — Frame ${activeIndex + 1}`}
            photoId={currentPhoto.id}
            imageUrl={currentPhoto.cloudinary_url}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ink transition-all hover:bg-soft active:scale-98 cursor-pointer"
            variant="compact"
          />
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize series"
            title="Maximize (F)"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ink transition-all hover:bg-soft active:scale-98 cursor-pointer"
          >
            <Maximize2 size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Maximize</span>
          </button>
        </div>
      </div>
      {/* Slide Technical Specifications Drawer */}
      {showExifDrawer && (
        <aside
          aria-label="Camera specifications for active frame"
          className="w-full rounded-xs border border-line bg-surface p-5 shadow-xs transition-all animate-[dialog-panel-in_200ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          <h3 className="editorial-label text-muted border-b border-line pb-2.5 font-medium">
            Frame {activeIndex + 1} Details
          </h3>
          {hasPhotoExif(currentPhoto) ? (
            <ExifSpecGrid photo={currentPhoto} compact />
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted">
                EXIF camera metadata was not recorded for this frame.
              </p>
            </div>
          )}
        </aside>
      )}
      {/* Fullscreen Modal View */}
      <FullscreenDialog
        isOpen={isMaximized}
        onClose={exitMaximize}
        ariaLabel={`${seriesTitle} fullscreen gallery`}
        title={seriesTitle}
        subtitle={<p className="text-xs font-mono text-muted">{createdAt}</p>}
        actions={
          <>
            <WallpaperPreviewButton
              photo={currentPhoto}
              fileName={slideDownloadFileName}
              variant="compact"
            />
            <DownloadButton
              photoId={currentPhoto.id}
              cloudinaryUrl={currentPhoto.cloudinary_url}
              fileName={slideDownloadFileName}
              variant="compact"
            />
            <ShareButton
              title={`${seriesTitle} — Frame ${activeIndex + 1}`}
              photoId={currentPhoto.id}
              imageUrl={currentPhoto.cloudinary_url}
              variant="compact"
            />
          </>
        }
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-serif text-base text-ink">
                {currentPhoto.title ||
                  `${seriesTitle} — Frame ${activeIndex + 1}`}
              </p>
              {(currentPhoto.description || seriesDescription) && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                  {currentPhoto.description || seriesDescription}
                </p>
              )}
            </div>
            {totalSlides > 1 && (
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-mono tabular-nums text-muted">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(totalSlides).padStart(2, "0")}
                </span>
                <nav
                  aria-label="Slide indicators"
                  className="flex items-center gap-0.5"
                >
                  {photos.map((photo, idx) => (
                    <button
                      key={`max-ind-${photo.id}-${idx}`}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-current={idx === activeIndex ? "true" : undefined}
                      className="group flex items-center py-2 px-1 cursor-pointer"
                    >
                      <span
                        className={`h-0.5 rounded-full transition-all duration-300 ${
                          idx === activeIndex
                            ? "w-6 bg-ink"
                            : "w-1.5 bg-line group-hover:bg-muted"
                        }`}
                      />
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        }
      >
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photograph"
              className="absolute left-3 sm:left-6 z-20 hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-md backdrop-blur-xs transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              disabled={activeIndex === totalSlides - 1}
              aria-label="Next photograph"
              className="absolute right-3 sm:right-6 z-20 hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-md backdrop-blur-xs transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </>
        )}
        <div
          ref={maxContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="flex h-full w-full select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging
              ? "none"
              : "transform 320ms cubic-bezier(0.25, 1, 0.5, 1)",
            willChange: isDragging ? "transform" : "auto",
          }}
        >
          {photos.map((photo, index) => {
            const slideTitle =
              photo.title || `Frame ${String(index + 1).padStart(2, "0")}`;
            const slideAlt = photo.description || photo.title || slideTitle;
            return (
              <div
                key={`max-slide-${photo.id}`}
                className="relative flex h-full w-full flex-none items-center justify-center select-none p-1 sm:p-4"
              >
                <div className="relative h-full w-full pointer-events-none select-none">
                  <Image
                    src={photo.cloudinary_url}
                    alt={slideAlt}
                    fill
                    sizes="100vw"
                    className="object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </FullscreenDialog>
    </section>
  );
}
