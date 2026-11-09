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
      className="mt-20 border-t border-line/70 pt-12"
    >
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((photo) => (
          <CoverCard
            key={photo.id}
            item={{
              id: photo.id,
              title: photo.title || "Untitled Momented",
              description: photo.description,
              cloudinary_url: photo.cloudinary_url,
            }}
            href={`/photo/${photo.id}`}
            size="compact"
            meta={photo.camera_model || undefined}
          />
        ))}
      </div>
    </section>
  );
}
