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
        fetchPriority={index < 3 ? "high" : index < 12 ? "auto" : "low"}
        loading={index < 12 ? "eager" : "lazy"}
      />
    </Link>
  );
}
