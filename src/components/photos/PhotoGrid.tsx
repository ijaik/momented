import PhotoCard from "@/components/photos/PhotoCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  emptyMessage?: string;
}
export default function PhotoGrid({
  photos,
  emptyMessage = "No photographs here yet.",
}: PhotoGridProps) {
  if (!photos || photos.length === 0)
    return <EmptyState description={emptyMessage} />;
  return (
    <section className="columns-1 gap-8 sm:columns-2 sm:gap-10 lg:columns-3">
      {photos.map((photo, index) => (
        <div key={photo.id} className="mb-8 break-inside-avoid sm:mb-10">
          <PhotoCard photo={photo} index={index} />
        </div>
      ))}
    </section>
  );
}
