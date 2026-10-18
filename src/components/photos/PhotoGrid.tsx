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
    <section className="columns-1 sm:columns-2 gap-5 lg:columns-3">
      {photos.map((photo, index) => (
        <div key={photo.id} className="break-inside-avoid mb-5">
          <PhotoCard photo={photo} index={index} />
        </div>
      ))}
    </section>
  );
}
