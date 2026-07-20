import Image from "next/image";
import Link from "next/link";
export default function PhotoCard({ photo, index = 10 }) {
  return (
    <Link
      href={`/photo/${photo.id}`}
      className="block break-inside-avoid relative group rounded-[10px] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <Image
        src={photo.cloudinary_url}
        alt={photo.title}
        width={photo.width}
        height={photo.height}
        className="w-full h-auto object-cover bg-zinc-200 dark:bg-zinc-900 group-hover:scale-105 transition-transform duration-700 ease-out"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={index < 6}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <div>
          <h2 className="text-white font-bold text-xl tracking-tight mb-1">
            {photo.title}
          </h2>
          {photo.camera_model && (
            <p className="text-white/80 text-xs uppercase tracking-wider font-medium">
              Shot on {photo.camera_model}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
