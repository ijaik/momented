import { ArrowRight, ArrowUpRight, Camera, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types";

interface HomeHeroProps {
  heroPhoto: Photo | null;
}
export default function HomeHero({ heroPhoto }: HomeHeroProps) {
  return (
    <section aria-label="Introduction and featured photograph">
      <header className="my-10 sm:my-14 md:my-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-soft/70 px-3.5 py-1 text-xs font-medium text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
          />
          <span>Photographs Journal</span>
        </div>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <h1 className="max-w-5xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
            Light, shadow, &amp; the moments in between.
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/photos"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all duration-150 hover:opacity-90 active:scale-95"
            >
              <span>Explore Photographs</span>
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
        <div className="group relative overflow-hidden rounded-2xl border border-line/70 bg-soft shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 hover:border-signal/40 hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)] active:scale-95 sm:active:scale-99">
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
                sizes="(max-width: 1024px) 100vw, 1280px"
                preload
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent sm:from-black/70 sm:via-transparent" />
              <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-md shadow-xs">
                  <Sparkles size={13} className="text-white/80" />
                  New
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
  );
}
