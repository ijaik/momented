"use client";
import { ArrowLeft, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DownloadButton from "@/components/photos/DownloadButton";
import ExifSpecGrid, { hasPhotoExif } from "@/components/photos/ExifSpecGrid";
import RelatedPhotos from "@/components/photos/RelatedPhotos";
import ShareButton from "@/components/photos/ShareButton";
import WallpaperPreviewButton from "@/components/photos/WallpaperPreviewButton";
import FullscreenDialog from "@/components/ui/FullscreenDialog";
import ReferenceRow, { type ReferenceLink } from "@/components/ui/ReferenceRow";
import { siteConfig } from "@/config/site";
import { formatDownloadFilename } from "@/lib/cloudinary/cloudinaryUtils";
import { useFullscreenMaximize } from "@/lib/hooks/useFullscreenMaximize";
import type { Photo } from "@/types";

interface PhotoDetailViewProps {
  photo: Photo;
  displayDate: string;
  references: ReferenceLink[];
  relatedPhotos?: Photo[];
}
export default function PhotoDetailView({
  photo,
  displayDate,
  references,
  relatedPhotos,
}: PhotoDetailViewProps) {
  const { isMaximized, toggleMaximize, exitMaximize } = useFullscreenMaximize();
  const title = photo.title || "Untitled Momented";
  const alt =
    photo.description && photo.title && photo.description !== photo.title
      ? `${photo.title} — ${photo.description}`
      : photo.title || photo.description || "A Momented Photograph";
  const fileName = formatDownloadFilename(photo.title);
  const hasExif = hasPhotoExif(photo);
  return (
    <>
      <div className="mt-6 md:mt-8">
        <Link
          href="/photos"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-ink active:scale-95"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-150 group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span>All Photographs</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16 mt-6 md:mt-10">
        <figure className="min-w-0 lg:sticky lg:top-20">
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize photograph (Press F)"
            title="Maximize (F)"
            className="group relative mx-auto flex w-fit max-w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-line/60 bg-soft shadow-[0_2px_14px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-line hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] focus-visible:outline-2 focus-visible:outline-ink active:scale-95"
            style={{
              maxHeight: "min(78vh, calc(100vh - 10rem))",
            }}
          >
            <Image
              src={photo.cloudinary_url}
              alt={alt}
              width={photo.width || 1200}
              height={photo.height || 800}
              sizes="(max-width: 1024px) 100vw, 750px"
              preload
              className="block h-auto max-h-[min(78vh,calc(100vh-10rem))] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-surface/80 px-3 py-1.5 text-xs font-medium text-ink opacity-0 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 hover:bg-surface active:scale-95"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>Maximize</span>
            </span>
          </button>
          <figcaption className="mt-6 border-b border-line/70 pb-6">
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl md:text-[2.5rem]">
              {title}
            </h1>
            {photo.description ? (
              <p className="mt-3.5 max-w-xl whitespace-pre-wrap text-base leading-relaxed text-muted">
                {photo.description}
              </p>
            ) : (
              <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-muted">
                A public domain photograph documenting light and atmosphere,
                dedicated under Creative Commons CC0 1.0 Universal.
              </p>
            )}
            <p className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted">
              <span>{displayDate}</span>
              {photo.camera_model && (
                <>
                  <span aria-hidden="true">—</span>
                  <span>Shot on {photo.camera_model}</span>
                </>
              )}
              <span aria-hidden="true">—</span>
              <span>by {photo.artist || siteConfig.author.name}</span>
            </p>
          </figcaption>
        </figure>
        <aside className="flex min-w-0 flex-col gap-10">
          <section aria-label="Photograph exposure details">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="editorial-label text-muted font-medium">
                Details
              </h2>
              {hasExif && (
                <span className="text-[11px] font-mono uppercase tracking-wider text-signal font-medium">
                  EXIF recorded
                </span>
              )}
            </div>
            {hasExif ? (
              <div className="rounded-2xl border border-line/60 bg-surface/75 p-5 shadow-xs backdrop-blur-md">
                <ExifSpecGrid photo={photo} />
              </div>
            ) : (
              <div className="border-t border-line/60 py-4">
                <p className="text-sm font-medium text-muted">
                  EXIF camera metadata was not recorded for this photograph.
                </p>
              </div>
            )}
          </section>
          {references.length > 0 && (
            <section aria-label="Related collections">
              <h2 className="mb-2 editorial-label text-muted font-medium">
                Part of
              </h2>
              <ul className="divide-y divide-line/60 border-y border-line/60 last:border-b-0">
                {references.map((ref) => (
                  <ReferenceRow key={`${ref.kind}-${ref.id}`} link={ref} />
                ))}
              </ul>
            </section>
          )}
          <section
            aria-label="Actions"
            className="flex flex-col gap-3 border-t border-line/70 pt-8"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DownloadButton
                photoId={photo.id}
                cloudinaryUrl={photo.cloudinary_url}
                downloadCount={photo.downloads || 0}
                fileName={fileName}
              />
              <ShareButton
                title={title}
                photoId={photo.id}
                imageUrl={photo.cloudinary_url}
                shareCount={photo.shares || 0}
              />
            </div>
            <WallpaperPreviewButton photo={photo} fileName={fileName} />
          </section>
        </aside>
      </div>
      {relatedPhotos && relatedPhotos.length > 0 && (
        <RelatedPhotos photos={relatedPhotos} />
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
            <WallpaperPreviewButton
              photo={photo}
              fileName={fileName}
              variant="compact"
            />
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
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
            draggable={false}
          />
        </button>
      </FullscreenDialog>
    </>
  );
}
