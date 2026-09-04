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
  const title = photo.title || "Untitled";
  return (
    <figure className="mb-10 break-inside-avoid">
      <Link
        href={`/photo/${photo.id}`}
        aria-label={`${title}${photo.camera_model ? `, shot on ${photo.camera_model}` : ""}`}
        className="focus-media group relative block w-full overflow-hidden bg-soft"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <Image
          src={photo.cloudinary_url}
          alt={title}
          width={photo.width || 800}
          height={photo.height || 600}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          priority={index < 4}
        />
      </Link>
      {(title || photo.dayContext) && (
        <figcaption className="mt-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[15px] font-medium leading-snug text-ink">
              {title}
            </span>
            {photo.dayContext && (
              <span className="shrink-0 text-[13px] text-muted">
                {photo.dayContext.current} of {photo.dayContext.total}
              </span>
            )}
          </div>
          {photo.camera_model && (
            <p className="mt-0.5 text-[13px] text-muted">
              Shot on {photo.camera_model}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
