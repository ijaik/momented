import { ArrowRight, Film, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import type { HomeEditorialData } from "@/lib/db/queries";

interface HomeFeaturedSeriesProps {
  featuredSeries: HomeEditorialData["featuredSeries"];
}
export default function HomeFeaturedSeries({
  featuredSeries,
}: HomeFeaturedSeriesProps) {
  if (!featuredSeries) return null;
  return (
    <section
      id="series"
      aria-labelledby="series-heading"
      className="reveal border-t border-line/70 pt-16 sm:pt-24"
    >
      <SectionHeader
        id="series-heading"
        label="01 / Series"
        icon={Film}
        title="Photographs in sequence"
        description="Sequence of photographs exploring changes in light and scenes."
        action={{
          href: "/series",
          label: "Browse all series",
        }}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <Link
            href={`/series/${featuredSeries.id}`}
            className="focus-media group block relative aspect-16/10 overflow-hidden rounded-2xl border border-line/70 bg-soft shadow-[0_2px_14px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:border-line hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] active:scale-95"
            aria-label={`Open series: ${featuredSeries.title}`}
          >
            {featuredSeries.photos[0] ? (
              <Image
                src={featuredSeries.photos[0].cloudinary_url}
                alt={featuredSeries.photos[0].title || featuredSeries.title}
                fill
                sizes="(max-width: 1024px) 100vw, 750px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No photographs yet
              </div>
            )}
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-mono tracking-wider text-white backdrop-blur-md">
              <Layers size={13} aria-hidden="true" />
              <span>{featuredSeries.photos.length} frames</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 lg:col-span-5">
          <div>
            <span className="editorial-label text-signal/90 font-medium">
              Featured Series
            </span>
            <h3 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight text-ink leading-tight">
              {featuredSeries.title}
            </h3>
            {featuredSeries.description && (
              <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-muted">
                {featuredSeries.description}
              </p>
            )}
          </div>
          {featuredSeries.photos.length > 1 && (
            <div>
              <p className="mb-3 text-[11px] font-mono uppercase tracking-wider text-muted">
                Progression
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {featuredSeries.photos.slice(0, 4).map((p, idx) => (
                  <Link
                    key={p.id}
                    href={`/photo/${p.id}`}
                    aria-label={`View photograph: ${p.title || `Slide ${idx + 1}`}`}
                    className="group/thumb relative aspect-square overflow-hidden rounded-xl border border-line/60 bg-soft shadow-2xs transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src={p.cloudinary_url}
                      alt={p.title || `Slide ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 right-1 rounded-sm bg-black/65 px-1 py-0.5 text-[9px] font-mono text-white/90">
                      0{idx + 1}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div>
            <Link
              href={`/series/${featuredSeries.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-paper transition-all hover:opacity-90 active:scale-95 shadow-xs"
            >
              <span>View Series</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
