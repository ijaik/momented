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
          className="h-16 w-16 shrink-0 rounded-sm border border-line object-cover bg-soft"
        />
      ))}
    </div>
  );
}
