import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Compass,
  Film,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PhotoCard from "@/components/photos/PhotoCard";
import JsonLd from "@/components/seo/JsonLd";
import CoverCard from "@/components/ui/CoverCard";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionLabel from "@/components/ui/SectionLabel";
import { getHomeEditorialData } from "@/lib/db/queries";
import { websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Momented — Minimalist Photography Journal & Archive",
  description:
    "An independent minimalist photography journal and open visual archive of light, shadow, and moments in between. Free high-resolution photography to view and download.",
  path: "/",
});
export default async function Home() {
  const {
    heroPhoto,
    recentPhotos,
    totalPhotos,
    featuredSeries,
    featuredCollection,
    featuredRule,
    featuredCalendar,
  } = await getHomeEditorialData();
  return (
    <>
      <JsonLd data={[websiteJsonLd()]} />
      <div className="flex flex-col gap-24 sm:gap-32 md:gap-40 pb-12">
        <section aria-label="Introduction and featured photograph">
          <header className="my-12 md:my-16 xl:my-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-soft/70 px-3.5 py-1 text-xs font-medium text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
              />
              <span>Open Visual Archive</span>
            </div>
            <h1 className="max-w-5xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Light, shadow, &amp; the moments in between.
            </h1>
            <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                An independent minimalist photography journal capturing quiet
                stillness, architectural geometries, and fleeting atmospheric
                studies.
              </p>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href="/photos"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all duration-150 hover:opacity-90 active:scale-95"
                >
                  <span>Explore Archive</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-4 py-2.5 text-sm font-medium text-muted transition-all duration-150 hover:bg-soft hover:text-ink active:scale-95"
                >
                  About
                </Link>
              </div>
            </div>
          </header>
          {heroPhoto && (
            <div className="group relative overflow-hidden rounded-2xl border border-line/70 bg-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 hover:border-signal/40 hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]">
              <Link
                href={`/photo/${heroPhoto.id}`}
                className="focus-media block"
                aria-label={`View featured frame: ${heroPhoto.title || "Untitled"}`}
              >
                <div className="relative aspect-4/3 sm:aspect-16/10 md:aspect-video max-h-[75vh] w-full overflow-hidden">
                  <Image
                    src={heroPhoto.cloudinary_url}
                    alt={heroPhoto.title || "Featured Momented Photograph"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1440px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent sm:from-black/70 sm:via-transparent" />
                  <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-md shadow-xs">
                      <Sparkles size={13} className="text-white/80" />
                      Frame of the Moment
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col justify-end">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight">
                          {heroPhoto.title || "Untitled Frame"}
                        </p>
                        {heroPhoto.camera_model && (
                          <p className="mt-1 flex items-center gap-2 text-xs font-mono text-white/75">
                            <Camera size={13} aria-hidden="true" />
                            <span>{heroPhoto.camera_model}</span>
                            {heroPhoto.focal_length && (
                              <span>• {heroPhoto.focal_length}</span>
                            )}
                            {heroPhoto.aperture && (
                              <span>• {heroPhoto.aperture}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/20 transition-transform duration-200 group-hover:translate-x-1">
                        View photograph
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </section>
        {featuredSeries && (
          <section
            id="series"
            aria-labelledby="series-heading"
            className="border-t border-line/80 pt-16 sm:pt-20"
          >
            <SectionHeader
              label="01 / Visual Sequences"
              icon={Film}
              title="Stories framed in progression"
              description="Sequenced visual narratives exploring a single continuum of light, atmosphere, and movement."
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
                    className="focus-media group block relative aspect-16/10 overflow-hidden rounded-xl border border-line/60 bg-soft shadow-xs"
                    aria-label={`Open series: ${featuredSeries.title}`}
                  >
                    {featuredSeries.photos[0] ? (
                      <Image
                        src={featuredSeries.photos[0].cloudinary_url}
                        alt={
                          featuredSeries.photos[0].title || featuredSeries.title
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 700px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted">
                        No frames yet
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      <Layers size={13} aria-hidden="true" />
                      <span>{featuredSeries.photos.length} frames</span>
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
                      <span>Experience Series</span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <section
          id="perspectives"
          aria-labelledby="perspectives-heading"
          className="border-t border-line/80 pt-16 sm:pt-20"
        >
          <SectionHeader
            label="02 / Curated Lenses"
            icon={Compass}
            title="Three ways to experience the collection"
            description="Beyond individual frames, photographs are organized through thematic atmosphere, compositional craft, and seasonal light."
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  By Atmosphere
                </span>
                <Link
                  href="/collections"
                  className="text-xs font-medium text-signal hover:underline"
                >
                  All themes →
                </Link>
              </div>
              {featuredCollection ? (
                <CoverCard
                  item={featuredCollection}
                  href={`/collections/${featuredCollection.id}`}
                  index={0}
                  aspectRatio="4/3"
                />
              ) : (
                <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
                  No collections yet
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  By Technique
                </span>
                <Link
                  href="/collections/rules"
                  className="text-xs font-medium text-signal hover:underline"
                >
                  All rules →
                </Link>
              </div>
              {featuredRule ? (
                <CoverCard
                  item={featuredRule}
                  href={`/collections/rules/${featuredRule.id}`}
                  index={1}
                  aspectRatio="4/3"
                />
              ) : (
                <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
                  No rule collections yet
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  By Season
                </span>
                <Link
                  href="/collections/calendar"
                  className="text-xs font-medium text-signal hover:underline"
                >
                  Full calendar →
                </Link>
              </div>
              {featuredCalendar ? (
                <CoverCard
                  item={featuredCalendar}
                  href={`/collections/calendar/${featuredCalendar.id}`}
                  index={2}
                  aspectRatio="4/3"
                />
              ) : (
                <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
                  No calendar collections yet
                </div>
              )}
            </div>
          </div>
        </section>
        {recentPhotos.length > 0 && (
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
                    Every frame is preserved to view, download, and adapt for personal or
                    commercial projects without restrictions.
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
        )}
        <section
          aria-labelledby="philosophy-heading"
          className="border-t border-line/80 pt-16 sm:pt-20"
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div className="rounded-2xl border border-line/70 bg-surface/60 p-7 sm:p-8 shadow-xs">
              <SectionLabel>Open Access</SectionLabel>
              <h2
                id="philosophy-heading"
                className="mt-2 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink"
              >
                Public Domain Archive
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                All photographs on Momented are dedicated to the public domain
                under Creative Commons Zero (CC0). You are free to view,
                download, adapt, and use any image for personal, editorial, or
                commercial projects without permission, fees, or restrictions.
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-surface/60 p-7 sm:p-8 shadow-xs">
              <SectionLabel>Behind the Lens</SectionLabel>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                A Study in Pause
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Momented is an ongoing pursuit of intentional stillness—letting
                morning shadows, raw architectural textures, and fleeting
                atmospheres speak without noise.
              </p>
              <div className="mt-5">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline underline-offset-4"
                >
                  <span>Read creator note &amp; camera gear</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
