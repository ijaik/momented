import PhotoGrid from "@/components/photos/PhotoGrid";
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
        id="recent-heading"
        label="03 / New Photographs"
        title="Recent Additions"
        description="The latest photographs added to Momented."
        action={{
          href: "/photos",
          label: `View all ${totalPhotos} photographs`,
        }}
      />
      <PhotoGrid photos={recentPhotos} />
    </section>
  );
}
