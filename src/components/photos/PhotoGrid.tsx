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
    <section aria-label="Photo gallery">
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:gap-8 [column-fill:balance]">
        {photos.map((photo, index) => (
          <div key={photo.id} className="mb-6 xl:mb-8 break-inside-avoid">
            <PhotoCard photo={photo} preload={index < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
