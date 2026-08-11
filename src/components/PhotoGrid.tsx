import PhotoCard from "@/components/PhotoCard";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  emptyMessage?: string;
}
export default function PhotoGrid({
  photos,
  emptyMessage = "No photos captured yet.",
}: PhotoGridProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-24 px-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 dark:text-zinc-400">
        {emptyMessage}
      </div>
    );
  }
  return (
    <section className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </section>
  );
}
