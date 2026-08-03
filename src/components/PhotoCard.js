import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
export default function PhotoCard({ photo, index = 10 }) {
  return (
    <div className="break-inside-avoid relative group rounded-[10px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
      <Link
        href={`/photo/${photo.id}`}
        className="block relative cursor-pointer"
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
      <ShareButton
        variant="icon"
        title={photo.title}
        photoId={photo.id}
        url={`/photo/${photo.id}`}
        imageUrl={photo.cloudinary_url}
        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 translate-y-2 group-hover:translate-y-0 focus-visible:translate-y-0 transition-all duration-300"
      />
    </div>
  );
}
