import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types";

interface PhotoCardProps {
  photo: Photo;
  index?: number;
}
export default function PhotoCard({ photo, index = 0 }: PhotoCardProps) {
  const aspectRatio =
    photo.width && photo.height ? photo.width / photo.height : 1;
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="group relative block w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 break-inside-avoid mb-6 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <Image
        src={photo.cloudinary_url}
        alt={photo.title || "Photographed Moment"}
        width={photo.width || 800}
        height={photo.height || 600}
        className="w-full h-full object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-500 ease-out"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={index < 6}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between text-white pointer-events-none">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1">
            {photo.title || "Untitled"}
          </h3>
          {photo.camera_model && (
            <p className="text-xs text-zinc-300 font-normal mt-0.5">
              {photo.camera_model}
            </p>
          )}
        </div>
        {photo.dayContext && (
          <span className="text-[10px] uppercase font-mono tracking-widest bg-black/40 backdrop-blur-xs px-2 py-1 rounded-md text-zinc-300 border border-white/10">
            {photo.dayContext.current}/{photo.dayContext.total}
          </span>
        )}
      </div>
    </Link>
  );
}
