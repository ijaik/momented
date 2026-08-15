import PhotoCard from "@/components/photos/PhotoCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  emptyMessage?: string;
}
export default function PhotoGrid({
  photos,
  emptyMessage = "No photos captured yet.",
}: PhotoGridProps) {
  if (!photos || photos.length === 0)
    return <EmptyState description={emptyMessage} />;
  return (
    <section className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </section>
  );
}
