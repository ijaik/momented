"use client";
import { ChevronLeft, ChevronRight, Info, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import DownloadButton from "@/components/photos/DownloadButton";
import ExifSpecGrid, { hasPhotoExif } from "@/components/photos/ExifSpecGrid";
import ShareButton from "@/components/photos/ShareButton";
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
export default function SeriesCarousel({
  seriesTitle,
  seriesDescription,
  photos,
  createdAt,
}: SeriesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { isMaximized, toggleMaximize, exitMaximize } = useFullscreenMaximize();
  const [showExifDrawer, setShowExifDrawer] = useState(false);
  const totalSlides = photos.length;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const currentDragOffset = useRef(0);
  const isMouseDown = useRef(false);
  const mouseStartX = useRef(0);
  const mouseStartTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxContainerRef = useRef<HTMLDivElement>(null);
  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      setActiveIndex(clamped);
      setDragOffset(0);
      currentDragOffset.current = 0;
    },
    [totalSlides],
  );
  useEffect(() => {
    const onWindowKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(activeIndex + 1);
      } else if (e.code === "Space" && !isMaximized) {
        e.preventDefault();
        goToSlide(activeIndex < totalSlides - 1 ? activeIndex + 1 : 0);
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [activeIndex, goToSlide, isMaximized, totalSlides]);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalSlides <= 1) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = null;
    currentDragOffset.current = 0;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (totalSlides <= 1 || e.touches.length === 0) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = false;
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) {
        isHorizontalSwipe.current = true;
      }
    }
    if (!isHorizontalSwipe.current) return;
    let dampenedOffset = deltaX;
    const containerWidth = containerRef.current?.clientWidth || 600;
    if (activeIndex === 0 && deltaX > 0)
      dampenedOffset = rubberband(deltaX, containerWidth);
    else if (activeIndex === totalSlides - 1 && deltaX < 0)
      dampenedOffset = rubberband(deltaX, containerWidth);
    currentDragOffset.current = dampenedOffset;
    setDragOffset(dampenedOffset);
  };
  const handleTouchEnd = () => {
    if (totalSlides <= 1 || !isDragging) return;
    setIsDragging(false);
    const deltaX = currentDragOffset.current;
    const elapsed = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = Math.abs(deltaX) / elapsed;
    if (deltaX < 0 && activeIndex < totalSlides - 1) {
      if (deltaX < -40 || (deltaX < -20 && velocity > 0.25)) {
        setActiveIndex((prev) => Math.min(totalSlides - 1, prev + 1));
      }
    } else if (deltaX > 0 && activeIndex > 0) {
      if (deltaX > 40 || (deltaX > 20 && velocity > 0.25)) {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    }
    setDragOffset(0);
    currentDragOffset.current = 0;
    isHorizontalSwipe.current = null;
  };
  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    currentDragOffset.current = 0;
    isHorizontalSwipe.current = null;
  };
  useEffect(() => {
    const container = isMaximized
      ? maxContainerRef.current
      : containerRef.current;
    if (!container || totalSlides <= 1) return;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isMouseDown.current = true;
      mouseStartX.current = e.clientX;
      mouseStartTime.current = Date.now();
      currentDragOffset.current = 0;
      setIsDragging(true);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current || totalSlides <= 1) return;
      const deltaX = e.clientX - mouseStartX.current;
      let dampenedOffset = deltaX;
      const containerWidth = container?.clientWidth || 600;
      if (activeIndex === 0 && deltaX > 0)
        dampenedOffset = rubberband(deltaX, containerWidth);
      else if (activeIndex === totalSlides - 1 && deltaX < 0)
        dampenedOffset = rubberband(deltaX, containerWidth);
      currentDragOffset.current = dampenedOffset;
      setDragOffset(dampenedOffset);
    };
    const handleMouseUp = () => {
      if (!isMouseDown.current) return;
      isMouseDown.current = false;
      setIsDragging(false);
      const deltaX = currentDragOffset.current;
      const elapsed = Math.max(1, Date.now() - mouseStartTime.current);
      const velocity = Math.abs(deltaX) / elapsed;
      if (deltaX < 0 && activeIndex < totalSlides - 1) {
        if (deltaX < -40 || (deltaX < -20 && velocity > 0.25)) {
          setActiveIndex((prev) => Math.min(totalSlides - 1, prev + 1));
        }
      } else if (deltaX > 0 && activeIndex > 0) {
        if (deltaX > 40 || (deltaX > 20 && velocity > 0.25)) {
          setActiveIndex((prev) => Math.max(0, prev - 1));
        }
      }
      setDragOffset(0);
      currentDragOffset.current = 0;
    };
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeIndex, totalSlides, isMaximized]);
  const currentPhoto = photos[activeIndex] || photos[0];
  if (!currentPhoto) return null;
  const currentAspect =
    currentPhoto.width && currentPhoto.height
      ? currentPhoto.width / currentPhoto.height
      : 4 / 3;
  const currentAspectNum = Number(currentAspect.toFixed(4));
  const maxPixelWidth = Math.round(680 * currentAspect);
  const containerMaxWidth = `min(100%, calc(78vh * ${currentAspectNum}), ${maxPixelWidth}px)`;
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
      className="flex flex-col gap-5"
    >
      <div
        className="relative mx-auto w-full overflow-hidden rounded-xl border border-line/70 bg-soft shadow-xs touch-pan-y select-none transition-[max-width,aspect-ratio] duration-300 ease-out"
        style={{
          aspectRatio: `${currentAspect}`,
          maxHeight: "min(78vh, 680px)",
          maxWidth: containerMaxWidth,
        }}
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
            const isAdjacent = Math.abs(index - activeIndex) <= 1;
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    className="object-cover pointer-events-none select-none"
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={isAdjacent ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {totalSlides > 1 && (
        <div className="flex w-full items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-muted">
              {activeIndex + 1} / {totalSlides}
            </span>
            <nav
              aria-label="Slide indicators"
              className="flex items-center gap-1.5"
            >
              {photos.map((photo, idx) => (
                <button
                  key={`indicator-${photo.id}-${idx}`}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-6 bg-signal"
                      : "w-1.5 bg-line hover:bg-muted"
                  }`}
                />
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photograph"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-surface/80 backdrop-blur-xs text-ink shadow-xs transition-all duration-100 hover:bg-soft active:scale-90 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              disabled={activeIndex === totalSlides - 1}
              aria-label="Next photograph"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-surface/80 backdrop-blur-xs text-ink shadow-xs transition-all duration-100 hover:bg-soft active:scale-90 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div className="flex w-full flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl">
            {currentPhoto.title || `${seriesTitle} — Frame ${activeIndex + 1}`}
          </h2>
          {(currentPhoto.description || seriesDescription) && (
            <p className="mt-1 text-sm text-muted">
              {currentPhoto.description || seriesDescription}
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
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
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-100 active:scale-95 ${
              showExifDrawer
                ? "border-signal/50 bg-signal/10 text-signal"
                : "border-line/80 bg-surface/80 backdrop-blur-xs text-ink hover:bg-soft"
            }`}
          >
            <Info size={16} aria-hidden="true" />
            <span>{showExifDrawer ? "Hide details" : "Frame details"}</span>
          </button>
          <DownloadButton
            photoId={currentPhoto.id}
            cloudinaryUrl={currentPhoto.cloudinary_url}
            cloudinaryPublicId={currentPhoto.cloudinary_public_id}
            fileName={slideDownloadFileName}
            className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 backdrop-blur-xs px-3.5 py-2 text-sm font-medium text-ink transition-all duration-100 hover:bg-soft active:scale-95 disabled:opacity-60"
            variant="compact"
          />
          <ShareButton
            title={`${seriesTitle} — Frame ${activeIndex + 1}`}
            photoId={currentPhoto.id}
            imageUrl={currentPhoto.cloudinary_url}
            className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 backdrop-blur-xs px-3.5 py-2 text-sm font-medium text-ink transition-all duration-100 hover:bg-soft active:scale-95"
            variant="compact"
          />
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize series"
            title="Maximize (F)"
            className="inline-flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 backdrop-blur-xs px-3.5 py-2 text-sm font-medium text-ink transition-all duration-100 hover:bg-soft active:scale-95"
          >
            <Maximize2 size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Maximize</span>
          </button>
        </div>
      </div>
      {showExifDrawer && (
        <aside
          aria-label="Camera specifications for active frame"
          className="w-full rounded-2xl border border-line/60 bg-surface/85 p-5 shadow-xs backdrop-blur-md transition-all animate-[dialog-panel-in_200ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted border-b border-line/60 pb-2.5">
            Frame {activeIndex + 1} Details
          </h3>
          {hasPhotoExif(currentPhoto) ? (
            <ExifSpecGrid photo={currentPhoto} compact />
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm sm:text-base md:text-lg font-medium text-muted">
                I lost it 😭
              </p>
            </div>
          )}
        </aside>
      )}
      <FullscreenDialog
        isOpen={isMaximized}
        onClose={exitMaximize}
        ariaLabel={`${seriesTitle} fullscreen gallery`}
        title={seriesTitle}
        subtitle={<p className="text-xs text-muted">{createdAt}</p>}
        actions={
          <>
            <DownloadButton
              photoId={currentPhoto.id}
              cloudinaryUrl={currentPhoto.cloudinary_url}
              cloudinaryPublicId={currentPhoto.cloudinary_public_id}
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
              <p className="truncate font-serif text-base font-medium text-ink">
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
                <span className="text-xs font-medium tabular-nums text-muted">
                  {activeIndex + 1} / {totalSlides}
                </span>
                <nav
                  aria-label="Slide indicators"
                  className="flex items-center gap-1.5"
                >
                  {photos.map((photo, idx) => (
                    <button
                      key={`max-ind-${photo.id}-${idx}`}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-current={idx === activeIndex ? "true" : undefined}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeIndex
                          ? "w-6 bg-signal"
                          : "w-1.5 bg-line hover:bg-muted"
                      }`}
                    />
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
              className="absolute left-3 sm:left-6 z-20 hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-md backdrop-blur-xs transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-20"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              disabled={activeIndex === totalSlides - 1}
              aria-label="Next photograph"
              className="absolute right-3 sm:right-6 z-20 hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-md backdrop-blur-xs transition-colors hover:bg-soft disabled:pointer-events-none disabled:opacity-20"
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
            const isAdjacent = Math.abs(index - activeIndex) <= 1;
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
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={isAdjacent ? "eager" : "lazy"}
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
