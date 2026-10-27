"use client";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DownloadButton from "@/components/photos/DownloadButton";
import ExifSpecGrid, { hasPhotoExif } from "@/components/photos/ExifSpecGrid";
import ShareButton from "@/components/photos/ShareButton";
import FullscreenDialog from "@/components/ui/FullscreenDialog";
import ReferenceRow, { type ReferenceLink } from "@/components/ui/ReferenceRow";
import { siteConfig } from "@/config/site";
import { formatDownloadFilename } from "@/lib/cloudinary/cloudinaryUtils";
import type { AdjacentPhotos } from "@/lib/db/queries";
import { useFullscreenMaximize } from "@/lib/hooks/useFullscreenMaximize";
import type { Photo } from "@/types";

interface PhotoDetailViewProps {
  photo: Photo;
  displayDate: string;
  references: ReferenceLink[];
  adjacent?: AdjacentPhotos;
}
export default function PhotoDetailView({
  photo,
  displayDate,
  references,
  adjacent,
}: PhotoDetailViewProps) {
  const router = useRouter();
  const { isMaximized, toggleMaximize, exitMaximize } = useFullscreenMaximize();
  const title = photo.title || "Untitled Momented";
  const alt =
    photo.description && photo.title && photo.description !== photo.title
      ? `${photo.title} — ${photo.description}`
      : photo.title || photo.description || "A Momented Photograph";
  const fileName = formatDownloadFilename(photo.title);
  const hasExif = hasPhotoExif(photo);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && adjacent?.prev) {
        e.preventDefault();
        router.push(`/photo/${adjacent.prev.id}`);
      } else if (e.key === "ArrowRight" && adjacent?.next) {
        e.preventDefault();
        router.push(`/photo/${adjacent.next.id}`);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adjacent, router]);
  return (
    <>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16 mt-8 md:mt-10">
        <figure className="min-w-0 lg:sticky lg:top-20">
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize photograph (Press F)"
            title="Maximize (F)"
            className="group relative mx-auto flex w-fit max-w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-line/70 bg-soft shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-signal/50 focus-visible:outline-2 focus-visible:outline-signal active:scale-[0.995]"
            style={{
              maxHeight: "min(72vh, calc(100vh - 12rem))",
            }}
          >
            <Image
              src={photo.cloudinary_url}
              alt={alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="block h-auto max-h-[min(72vh,calc(100vh-12rem))] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
              priority
              fetchPriority="high"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-surface/80 px-3 py-1.5 text-xs font-medium text-ink opacity-0 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 hover:bg-surface active:scale-95"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>Maximize</span>
            </span>
          </button>
          <figcaption className="mt-6 border-b border-line pb-6">
            <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            {photo.description && (
              <p className="mt-3.5 max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                {photo.description}
              </p>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <span>{displayDate}</span>
              {photo.camera_model && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Shot on {photo.camera_model}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>by {photo.artist || siteConfig.author.name}</span>
            </p>
          </figcaption>
        </figure>
        <aside className="flex min-w-0 flex-col gap-10">
          <section aria-label="Photograph exposure details">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Details
              </h2>
              {hasExif && (
                <span className="text-[11px] font-medium text-signal">
                  EXIF recorded
                </span>
              )}
            </div>
            {hasExif ? (
              <div className="rounded-2xl border border-line/60 bg-surface/75 p-5 shadow-xs backdrop-blur-md">
                <ExifSpecGrid photo={photo} />
              </div>
            ) : (
              <div className="border-t border-line py-4">
                <p className="text-sm sm:text-base md:text-lg font-medium text-muted">
                  I lost it 😭
                </p>
              </div>
            )}
          </section>
          {references.length > 0 && (
            <section aria-label="Related collections">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Part of
              </h2>
              <ul className="divide-y divide-line border-y border-line last:border-b-0">
                {references.map((ref) => (
                  <ReferenceRow key={`${ref.kind}-${ref.id}`} link={ref} />
                ))}
              </ul>
            </section>
          )}
          <section
            aria-label="Actions"
            className="grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2"
          >
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              cloudinaryPublicId={photo.cloudinary_public_id}
              downloadCount={photo.downloads || 0}
              fileName={fileName}
            />
            <ShareButton
              title={title}
              photoId={photo.id}
              imageUrl={photo.cloudinary_url}
              shareCount={photo.shares || 0}
            />
          </section>
        </aside>
      </div>
      {(adjacent?.prev || adjacent?.next) && (
        <nav
          aria-label="Photograph sequence navigation"
          className="mt-16 border-t border-line pt-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {adjacent?.prev ? (
              <Link
                href={`/photo/${adjacent.prev.id}`}
                className="group flex items-center gap-3.5 rounded-xl p-2 -m-2 transition-all duration-200 hover:bg-soft/50 active:scale-[0.98]"
                aria-label={`Previous photograph: ${adjacent.prev.title || "Untitled Momented"}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/70 bg-surface/80 backdrop-blur-xs text-ink transition-transform duration-300 ease-out group-hover:-translate-x-1">
                  <ChevronLeft size={18} aria-hidden="true" />
                </span>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line/70 bg-soft">
                  <Image
                    src={adjacent.prev.cloudinary_url}
                    alt={adjacent.prev.title || "A Momented photograph"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Previous moment
                  </span>
                  <p className="truncate font-serif text-sm font-medium text-ink">
                    {adjacent.prev.title || "Untitled Momented"}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            <div className="hidden text-center text-xs text-muted md:block">
              <kbd className="rounded-md border border-line/80 bg-surface/80 px-2 py-0.5 font-mono text-[11px] text-muted shadow-2xs">
                ←
              </kbd>{" "}
              or{" "}
              <kbd className="rounded-md border border-line/80 bg-surface/80 px-2 py-0.5 font-mono text-[11px] text-muted shadow-2xs">
                →
              </kbd>{" "}
              keys to walk gallery
            </div>
            {adjacent?.next ? (
              <Link
                href={`/photo/${adjacent.next.id}`}
                className="group flex items-center justify-end gap-3.5 rounded-xl p-2 -m-2 text-right transition-all duration-200 hover:bg-soft/50 active:scale-[0.98] sm:self-auto"
                aria-label={`Next photograph: ${adjacent.next.title || "Untitled Momented"}`}
              >
                <div className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Next moment
                  </span>
                  <p className="truncate font-serif text-sm font-medium text-ink">
                    {adjacent.next.title || "Untitled Momented"}
                  </p>
                </div>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line/70 bg-soft">
                  <Image
                    src={adjacent.next.cloudinary_url}
                    alt={adjacent.next.title || "A Momented photograph"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/70 bg-surface/80 backdrop-blur-xs text-ink transition-transform duration-300 ease-out group-hover:translate-x-1">
                  <ChevronRight size={18} aria-hidden="true" />
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      )}
      <FullscreenDialog
        isOpen={isMaximized}
        onClose={exitMaximize}
        title={title}
        subtitle={
          photo.description ? (
            <p className="text-xs text-muted">{photo.description}</p>
          ) : undefined
        }
        actions={
          <>
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              cloudinaryPublicId={photo.cloudinary_public_id}
              downloadCount={photo.downloads || 0}
              fileName={fileName}
              variant="compact"
            />
            <ShareButton
              title={title}
              photoId={photo.id}
              imageUrl={photo.cloudinary_url}
              shareCount={photo.shares || 0}
              variant="compact"
            />
          </>
        }
        footer={
          <p className="text-center text-xs text-muted">
            {displayDate}
            {photo.camera_model && ` · Shot on ${photo.camera_model}`}
            {` · by ${photo.artist || siteConfig.author.name}`}
          </p>
        }
        ariaLabel={`${title} fullscreen viewer`}
      >
        <button
          type="button"
          onClick={exitMaximize}
          aria-label="Minimize fullscreen view (Esc)"
          className="relative flex h-full w-full cursor-zoom-out items-center justify-center border-0 bg-transparent p-0"
        >
          <Image
            src={photo.cloudinary_url}
            alt={alt}
            fill
            sizes="100vw"
            className="object-contain pointer-events-none select-none"
            priority
            draggable={false}
          />
        </button>
      </FullscreenDialog>
    </>
  );
}
