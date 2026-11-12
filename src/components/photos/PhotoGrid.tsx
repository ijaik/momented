import PhotoCard from "@/components/photos/PhotoCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  emptyMessage?: string;
}
interface ColumnGroup {
  id: string;
  photos: Photo[];
}
function distributeIntoColumns(photos: Photo[], keys: string[]): ColumnGroup[] {
  const columnCount = keys.length;
  const columns: ColumnGroup[] = keys.map((key) => ({ id: key, photos: [] }));
  const heights = new Array(columnCount).fill(0);
  for (const photo of photos) {
    const normalizedHeight =
      photo.width && photo.height ? photo.height / photo.width : 1;
    const shortestCol = heights.indexOf(Math.min(...heights));
    columns[shortestCol].photos.push(photo);
    heights[shortestCol] += normalizedHeight;
  }
  return columns;
}
export default function PhotoGrid({
  photos,
  emptyMessage = "No photographs here yet.",
}: PhotoGridProps) {
  if (!photos || photos.length === 0)
    return <EmptyState description={emptyMessage} />;
  const cols2 = distributeIntoColumns(photos, ["col2-left", "col2-right"]);
  const cols3 = distributeIntoColumns(photos, [
    "col3-left",
    "col3-center",
    "col3-right",
  ]);
  return (
    <section aria-label="Photo gallery">
      {/* Mobile view (single column chronological order) */}
      <div className="flex flex-col gap-8 sm:hidden">
        {photos.map((photo, index) => (
          <PhotoCard key={photo.id} photo={photo} preload={index < 2} />
        ))}
      </div>
      {/* Tablet view (2 balanced columns) */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-6 items-start">
        {cols2.map((col, colIdx) => (
          <div key={col.id} className="flex flex-col gap-6">
            {col.photos.map((photo, photoIdx) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                preload={colIdx === 0 && photoIdx < 2}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Desktop view (3 balanced columns reading left-to-right across the top row) */}
      <div className="hidden lg:grid grid-cols-3 gap-6 xl:gap-8 items-start">
        {cols3.map((col, colIdx) => (
          <div key={col.id} className="flex flex-col gap-6 xl:gap-8">
            {col.photos.map((photo, photoIdx) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                preload={colIdx === 0 && photoIdx === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
