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
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="group relative block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 break-inside-avoid mb-6 cursor-pointer shadow-xs hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      <Image
        src={photo.cloudinary_url}
        alt={photo.title || "Photographed Moment"}
        width={photo.width || 800}
        height={photo.height || 600}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={index < 6}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 p-5 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between text-white pointer-events-none">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm tracking-tight line-clamp-1">
            {photo.title || "Untitled"}
          </h3>
          {photo.camera_model && (
            <p className="text-xs text-zinc-300 font-normal">
              {photo.camera_model}
            </p>
          )}
        </div>
        {photo.dayContext && (
          <span className="text-[10px] uppercase font-mono tracking-widest bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-zinc-200 border border-white/10 shadow-inner">
            {photo.dayContext.current}/{photo.dayContext.total}
          </span>
        )}
      </div>
    </Link>
  );
}
