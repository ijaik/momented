"use client";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  prevPhoto?: { id: string; title: string | null } | null;
  nextPhoto?: { id: string; title: string | null } | null;
}
export default function PhotoDetailView({
  photo,
  displayDate,
  references,
  relatedPhotos,
  prevPhoto,
  nextPhoto,
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
  const photoAspect =
    photo.width && photo.height ? photo.width / photo.height : 4 / 3;
  const photoAspectNum = Number(photoAspect.toFixed(4));
  // Lateral keyboard navigation between photographs (← / →)
  useEffect(() => {
    if (isMaximized) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (e.key === "ArrowLeft" && prevPhoto) {
        e.preventDefault();
        router.push(`/photo/${prevPhoto.id}`);
      } else if (e.key === "ArrowRight" && nextPhoto) {
        e.preventDefault();
        router.push(`/photo/${nextPhoto.id}`);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevPhoto, nextPhoto, isMaximized, router]);
  return (
    <>
      {/* Back Link & Lateral Sequential Navigation */}
      <div className="mt-8 md:mt-12 flex items-center justify-between border-b border-line/60 pb-4">
        <Link
          href="/photos"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft
            size={13}
            className="transition-transform duration-150 group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span>All Photographs</span>
        </Link>
        {(prevPhoto || nextPhoto) && (
          <nav
            aria-label="Previous and next photographs"
            className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider"
          >
            {prevPhoto ? (
              <Link
                href={`/photo/${prevPhoto.id}`}
                title={`Previous: ${prevPhoto.title || "Photograph"} (←)`}
                className="group inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
              >
                <ArrowLeft
                  size={12}
                  className="transition-transform duration-150 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            ) : (
              <span className="text-line cursor-not-allowed select-none">
                Prev
              </span>
            )}
            <span className="text-line" aria-hidden="true">
              /
            </span>
            {nextPhoto ? (
              <Link
                href={`/photo/${nextPhoto.id}`}
                title={`Next: ${nextPhoto.title || "Photograph"} (→)`}
                className="group inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight
                  size={12}
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <span className="text-line cursor-not-allowed select-none">
                Next
              </span>
            )}
          </nav>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16 mt-6 md:mt-10">
        {/* Left Column — Light Table Stage */}
        <figure className="min-w-0 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize photograph (Press F)"
            title="Maximize (F)"
            className="focus-media group relative mx-auto flex w-full max-w-full cursor-zoom-in items-center justify-center"
            style={{
              maxWidth: `min(100%, calc(min(78vh, calc(100vh - 10rem)) * ${photoAspectNum}))`,
            }}
          >
            <div
              className="relative w-full overflow-hidden select-none"
              style={{
                aspectRatio: `${photoAspectNum}`,
                maxHeight: "min(78vh, calc(100vh - 10rem))",
              }}
            >
              <Image
                src={photo.cloudinary_url}
                alt={alt}
                fill
                sizes="(max-width: 1024px) 100vw, 750px"
                preload
                className="object-contain transition-transform duration-700 ease-editorial group-hover:scale-102"
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink opacity-0 shadow-xs backdrop-blur-md transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>Maximize</span>
            </span>
          </button>
          {/* Mobile Caption Block (below image on small screens) */}
          <figcaption className="mt-6 border-b border-line/70 pb-6 lg:hidden">
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl font-normal">
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
        {/* Right Column — Editorial & Metadata Column */}
        <aside className="flex min-w-0 flex-col gap-8 sm:gap-10">
          {/* Desktop Heading Block */}
          <div className="hidden lg:block border-b border-line/70 pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.08] tracking-tight text-ink font-normal">
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
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted">
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
          </div>
          {/* Primary Action Section */}
          <section aria-label="Actions" className="flex flex-col gap-3">
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              downloadCount={photo.downloads || 0}
              fileName={fileName}
              variant="primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <ShareButton
                title={title}
                photoId={photo.id}
                imageUrl={photo.cloudinary_url}
                shareCount={photo.shares || 0}
              />
              <WallpaperPreviewButton photo={photo} fileName={fileName} />
            </div>
          </section>
          {/* Technical Specifications (EXIF) */}
          <section aria-label="Photograph exposure details">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="editorial-label text-muted font-medium">
                Details
              </h2>
              {hasExif && (
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
                  EXIF recorded
                </span>
              )}
            </div>
            {hasExif ? (
              <ExifSpecGrid photo={photo} />
            ) : (
              <div className="border-t border-line/60 py-3">
                <p className="text-xs font-medium text-muted">
                  EXIF camera metadata was not recorded for this photograph.
                </p>
              </div>
            )}
          </section>
          {/* Collections / Rules / Series Part Of */}
          {references.length > 0 && (
            <section aria-label="Related collections">
              <h2 className="mb-2 editorial-label text-muted font-medium">
                Part of
              </h2>
              <ul className="divide-y divide-line/60 border-y border-line/60">
                {references.map((ref) => (
                  <ReferenceRow key={`${ref.kind}-${ref.id}`} link={ref} />
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
      {relatedPhotos && relatedPhotos.length > 0 && (
        <RelatedPhotos photos={relatedPhotos} />
      )}
      {/* Fullscreen Dialog */}
      <FullscreenDialog
        isOpen={isMaximized}
        onClose={exitMaximize}
        title={title}
        subtitle={
          photo.description ? (
            <p className="text-xs text-muted truncate max-w-md">
              {photo.description}
            </p>
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
