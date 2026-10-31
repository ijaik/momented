import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types";
export default function PhotoCard({
  photo,
  index = 0,
}: {
  photo: Photo;
  index?: number;
}) {
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
      className="focus-media group relative block w-full overflow-hidden rounded-xl border border-line/60 bg-soft shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:border-signal/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] active:scale-[0.99]"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <Image
        src={photo.cloudinary_url}
        alt={alt}
        width={photo.width || 800}
        height={photo.height || 600}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 480px"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        priority={index === 0}
        loading={index === 0 ? undefined : "lazy"}
        fetchPriority={index === 0 ? "high" : "low"}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 bg-linear-to-t from-black/80 via-black/20 to-transparent sm:p-5"
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-base font-medium text-white sm:text-lg">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-white/75">View frame</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md shadow-xs transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
