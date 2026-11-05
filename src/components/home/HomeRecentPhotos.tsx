import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
      className="border-t border-line/80 pt-16 sm:pt-20"
    >
      <SectionHeader
        label="03 / Fresh Frames"
        title="Recent Additions"
        description="The latest moments documented in the archive."
        action={{
          href: "/photos",
          label: `View all ${totalPhotos} photographs`,
        }}
      />
      <div className="columns-2 gap-4 sm:gap-6 md:columns-4">
        {recentPhotos.map((photo, idx) => (
          <div key={photo.id} className="break-inside-avoid mb-4 sm:mb-6">
            <PhotoCard photo={photo} index={idx} />
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-line/80 bg-paper/70 p-8 sm:p-10 backdrop-blur-md shadow-xs">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              The Open Photography Vault
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Every frame is preserved to view, download, and adapt for personal
              or commercial projects without restrictions.
            </p>
          </div>
          <Link
            href="/photos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:opacity-90 active:scale-95 shadow-xs"
          >
            <span>Explore All {totalPhotos} Moments</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
