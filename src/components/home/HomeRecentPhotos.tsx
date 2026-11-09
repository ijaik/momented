import PhotoCard from "@/components/photos/PhotoCard";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Photo } from "@/types";

interface HomeRecentPhotosProps {
  recentPhotos: Photo[];
  totalPhotos: number;
}
export default function HomeRecentPhotos({
  recentPhotos,
  totalPhotos,
}: HomeRecentPhotosProps) {
  if (recentPhotos.length === 0) return null;
  return (
    <section
      aria-labelledby="recent-heading"
      className="border-t border-line/70 pt-16 sm:pt-24"
    >
      <SectionHeader
        label="03 / New Photographs"
        title="Recent Additions"
        description="The latest photographs added to Momented."
        action={{
          href: "/photos",
          label: `View all ${totalPhotos} photographs`,
        }}
      />
      <div className="columns-1 sm:columns-2 gap-6 md:columns-3 xl:gap-8">
        {recentPhotos.map((photo, idx) => (
          <div key={photo.id} className="break-inside-avoid mb-6 xl:mb-8">
            <PhotoCard photo={photo} index={idx} />
          </div>
        ))}
      </div>
    </section>
  );
}
