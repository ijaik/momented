"use client";
import { Maximize2 } from "lucide-react";
import Image from "next/image";
import DownloadButton from "@/components/photos/DownloadButton";
import InfoItem from "@/components/photos/InfoItem";
import ShareButton from "@/components/photos/ShareButton";
import FullscreenDialog from "@/components/ui/FullscreenDialog";
import ReferenceRow, { type ReferenceLink } from "@/components/ui/ReferenceRow";
import { siteConfig } from "@/config/site";
import { useFullscreenMaximize } from "@/lib/hooks/useFullscreenMaximize";
import type { Photo } from "@/types";

interface PhotoDetailViewProps {
  photo: Photo;
  displayDate: string;
  references: ReferenceLink[];
}
export default function PhotoDetailView({
  photo,
  displayDate,
  references,
}: PhotoDetailViewProps) {
  const { isMaximized, toggleMaximize, exitMaximize } = useFullscreenMaximize();
  const title = photo.title || "Untitled";
  const hasExif = Boolean(
    photo.camera_model ||
      photo.focal_length ||
      photo.aperture ||
      photo.shutter_speed ||
      photo.iso,
  );
  return (
    <>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16">
        <figure className="min-w-0 lg:sticky lg:top-20">
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize photograph"
            title="Maximize (F)"
            className="group relative mx-auto flex w-fit max-w-full cursor-zoom-in items-center justify-center overflow-hidden border border-line bg-soft shadow-xs transition-colors hover:border-signal/40 focus-visible:outline-2 focus-visible:outline-signal"
            style={{
              maxHeight: "min(72vh, calc(100vh - 12rem))",
            }}
          >
            <Image
              src={photo.cloudinary_url}
              alt={title}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="block h-auto max-h-[min(72vh,calc(100vh-12rem))] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
              fetchPriority="high"
              loading="eager"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface/90 px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-xs backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 hover:bg-soft"
            >
              <Maximize2 size={13} aria-hidden="true" />
              <span>Maximize</span>
            </span>
          </button>
          <figcaption className="mt-5">
            <h1 className="font-serif text-2xl font-medium leading-tight tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            {photo.description && (
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                {photo.description}
              </p>
            )}
            <p className="mt-2.5 text-sm text-muted">
              {displayDate}
              {photo.camera_model && ` · shot on ${photo.camera_model}`}
              {` · by ${photo.artist || siteConfig.author.name}`}
            </p>
          </figcaption>
        </figure>
        <aside className="flex min-w-0 flex-col gap-10">
          <section aria-label="Photograph details">
            <h2 className="mb-1 text-sm font-medium text-ink">Details</h2>
            {hasExif ? (
              <dl className="border-t border-line">
                {photo.camera_model && (
                  <InfoItem label="Camera" value={photo.camera_model} />
                )}
                <InfoItem label="Focal length" value={photo.focal_length} />
                <InfoItem label="Aperture" value={photo.aperture} />
                <InfoItem label="Shutter speed" value={photo.shutter_speed} />
                <InfoItem label="ISO" value={photo.iso?.toString()} />
              </dl>
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
              <h2 className="mb-1 text-sm font-medium text-ink">Part of</h2>
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
            <ShareButton
              title={photo.title || ""}
              photoId={photo.id}
              imageUrl={photo.cloudinary_url}
              shareCount={photo.shares || 0}
            />
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              downloadCount={photo.downloads || 0}
              fileName={`${(photo.title || "photograph").toLowerCase().replace(/\s+/g, "-")}.jpg`}
            />
          </section>
        </aside>
      </div>
      <FullscreenDialog
        isOpen={isMaximized}
        onClose={exitMaximize}
        title={title}
        subtitle={
          <p>
            {displayDate}
            {photo.camera_model && ` · Shot on ${photo.camera_model}`}
            {` · by ${photo.artist || siteConfig.author.name}`}
          </p>
        }
        actions={
          <>
            <DownloadButton
              photoId={photo.id}
              cloudinaryUrl={photo.cloudinary_url}
              downloadCount={photo.downloads || 0}
              fileName={`${(photo.title || "photograph").toLowerCase().replace(/\s+/g, "-")}.jpg`}
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
          photo.description ? (
            <div className="text-center">
              <p className="line-clamp-2 text-xs text-muted">
                {photo.description}
              </p>
            </div>
          ) : undefined
        }
        ariaLabel={`${title} fullscreen viewer`}
      >
        <button
          type="button"
          onClick={exitMaximize}
          aria-label="Minimize fullscreen view"
          className="relative flex h-full w-full cursor-zoom-out items-center justify-center border-0 bg-transparent p-0"
        >
          <Image
            src={photo.cloudinary_url}
            alt={title}
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
