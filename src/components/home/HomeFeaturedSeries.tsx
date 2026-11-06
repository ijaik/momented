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
      className="border-t border-line/80 pt-16 sm:pt-20"
    >
      <SectionHeader
        label="01 / Series"
        icon={Film}
        title="Photographs in sequence"
        description="Sequence of photographs exploring changes in light and scenes."
        action={{
          href: "/series",
          label: "Browse all series",
        }}
      />
      <div className="rounded-2xl border border-line/70 bg-surface/60 p-6 sm:p-8 shadow-xs backdrop-blur-md">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <Link
              href={`/series/${featuredSeries.id}`}
              className="focus-media group block relative aspect-16/10 overflow-hidden rounded-xl border border-line/60 bg-soft shadow-xs active:scale-95 sm:active:scale-99"
              aria-label={`Open series: ${featuredSeries.title}`}
            >
              {featuredSeries.photos[0] ? (
                <Image
                  src={featuredSeries.photos[0].cloudinary_url}
                  alt={featuredSeries.photos[0].title || featuredSeries.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  No photographs yet
                </div>
              )}
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                <Layers size={13} aria-hidden="true" />
                <span>{featuredSeries.photos.length} photographs</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted">
                Featured Series
              </span>
              <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                {featuredSeries.title}
              </h3>
              {featuredSeries.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {featuredSeries.description}
                </p>
              )}
            </div>
            {featuredSeries.photos.length > 1 && (
              <div>
                <p className="mb-2.5 text-xs font-medium text-muted">
                  Slide progression:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {featuredSeries.photos.slice(0, 4).map((p, idx) => (
                    <div
                      key={p.id}
                      className="relative aspect-square overflow-hidden rounded-lg border border-line/60 bg-soft"
                    >
                      <Image
                        src={p.cloudinary_url}
                        alt={p.title || `Slide ${idx + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[9px] font-mono text-white/90">
                        0{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Link
                href={`/series/${featuredSeries.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all hover:opacity-90 active:scale-95"
              >
                <span>View Series</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
