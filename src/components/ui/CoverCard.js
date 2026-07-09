import Image from "next/image";
import Link from "next/link";
export default function CoverCard({ item, href, index }) {
  const coverImage =
    item.photos?.find((p) => p.id === item.cover_photo_id)?.cloudinary_url ||
    item.photos?.[0]?.cloudinary_url;
  const photoCount = item.photos?.length || 0;
  return (
    <Link
      href={href}
      className="group relative aspect-video md:aspect-4/3 overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-900 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 block"
    >
      {coverImage
        ? <Image
            src={coverImage}
            alt={item.title}
            fill
            className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index < 4}
          />
        : <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-medium text-sm">
            Empty
          </div>}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      <div className="absolute bottom-10 left-10 z-20 transition-transform duration-500 group-hover:-translate-y-2">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {item.title}
        </h2>
        <p className="text-white/80 font-medium uppercase tracking-widest text-xs">
          {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
        </p>
      </div>
    </Link>
  );
}
