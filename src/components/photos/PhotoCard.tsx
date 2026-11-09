import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types";
export default function PhotoCard({ photo }: { photo: Photo }) {
  const aspectRatio =
    photo.width && photo.height ? photo.width / photo.height : 1;
  const title = photo.title || "Untitled Momented";
  const alt =
    photo.description && photo.title && photo.description !== photo.title
      ? `${photo.title} — ${photo.description}`
      : photo.title || photo.description || "A Momented photograph";
  return (
    <Link
      href={`/photo/${photo.id}`}
      aria-label={`${title}${photo.camera_model ? `, shot on ${photo.camera_model}` : ""}`}
      className="focus-media group relative block w-full overflow-hidden rounded-2xl border border-line/60 bg-soft shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:border-line hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] active:scale-95"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <Image
        src={photo.cloudinary_url}
        alt={alt}
        width={photo.width || 800}
        height={photo.height || 600}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 480px"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4.5 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 bg-linear-to-t from-black/80 via-black/20 to-transparent sm:p-5"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-base text-white tracking-tight sm:text-lg">
              {title}
            </p>
            {photo.camera_model ? (
              <p className="mt-0.5 truncate text-[11px] font-mono text-white/70">
                {photo.camera_model}
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] font-mono uppercase tracking-wider text-white/70">
                View frame
              </p>
            )}
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md shadow-xs transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
