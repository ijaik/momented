import CoverCard from "@/components/ui/CoverCard";
import type { Photo } from "@/types";

interface RelatedPhotosProps {
  photos: Photo[];
  title?: string;
  description?: string;
}
export default function RelatedPhotos({
  photos,
  title = "Related Moments",
  description = "More photographs matching the collection, rule, series, or season.",
}: RelatedPhotosProps) {
  if (!photos || photos.length === 0) return null;
  return (
    <section
      aria-label="Related photographs"
      className="mt-16 border-t border-line pt-10"
    >
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((photo, index) => (
          <CoverCard
            key={photo.id}
            item={{
              id: photo.id,
              title: photo.title || "Untitled Momented",
              description: photo.description,
              cloudinary_url: photo.cloudinary_url,
            }}
            href={`/photo/${photo.id}`}
            index={index}
            size="compact"
            meta={photo.camera_model || undefined}
          />
        ))}
      </div>
    </section>
  );
}
