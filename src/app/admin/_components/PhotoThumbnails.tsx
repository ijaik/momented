import Image from "next/image";
import type { ChecklistPhoto } from "./PhotoChecklist";

interface PhotoThumbnailsProps {
  photos?: ChecklistPhoto[];
  fallbackTitle?: string;
  className?: string;
}
export default function PhotoThumbnails({
  photos,
  fallbackTitle = "",
  className = "mt-6",
}: PhotoThumbnailsProps) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
      {photos.map((p) => (
        <Image
          key={p.id}
          src={p.cloudinary_url}
          alt={p.title || fallbackTitle}
          width={80}
          height={80}
          className="w-16 h-16 object-cover rounded-md shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        />
      ))}
    </div>
  );
}
