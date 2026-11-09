import { ArrowRight, ArrowUpRight, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types";

interface HomeHeroProps {
  heroPhoto: Photo | null;
}
export default function HomeHero({ heroPhoto }: HomeHeroProps) {
  if (!heroPhoto)
    return (
      <section
        aria-label="Introduction and journal headline"
        className="my-12 sm:my-16 md:my-20"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-signal/70" aria-hidden="true" />
          <span className="editorial-label text-signal/90 font-medium">
            Photographs Journal
          </span>
        </div>
        <h1 className="max-w-5xl font-serif text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
          Light, shadow, &amp; the moments in between.
        </h1>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/photos"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-xs font-mono uppercase tracking-wider text-paper transition-all hover:opacity-90 active:scale-95"
          >
            <span>Explore Photographs</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink underline underline-offset-4 transition-colors"
          >
            About
          </Link>
        </div>
      </section>
    );
  return (
    <section
      aria-label="Introduction and featured photograph"
      className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen -mt-16 sm:-mt-20 md:-mt-24 xl:-mt-28 overflow-hidden select-none"
    >
      <div className="relative min-h-[85vh] sm:min-h-[88vh] md:min-h-[92vh] w-full flex flex-col justify-between">
        <Image
          src={heroPhoto.cloudinary_url}
          alt={heroPhoto.title || "Featured Momented Photograph"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-transform duration-1000 ease-linear"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/85"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-transparent to-black/35"
        />
        <div className="pt-24 sm:pt-28" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8 xl:max-w-7xl 2xl:max-w-360 py-12 sm:py-16 flex flex-col justify-end">
          <div className="max-w-4xl">
            <div className="mb-4 sm:mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-white/70" aria-hidden="true" />
              <span className="editorial-label text-white/80 font-medium tracking-widest">
                Photographs Journal
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium leading-[1.02] tracking-tight text-white">
              Light, shadow, &amp; the moments in between.
            </h1>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="min-w-0">
              <Link
                href={`/photo/${heroPhoto.id}`}
                className="group inline-flex items-center gap-2 text-white hover:text-white/85 transition-colors"
                aria-label={`View featured frame: ${heroPhoto.title || "Untitled"}`}
              >
                <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight">
                  {heroPhoto.title || "Untitled Frame"}
                </span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-80"
                  aria-hidden="true"
                />
              </Link>
              {heroPhoto.camera_model && (
                <p className="mt-1 flex items-center gap-2 text-xs font-mono text-white/75">
                  <Camera size={13} aria-hidden="true" />
                  <span>{heroPhoto.camera_model}</span>
                  {heroPhoto.focal_length && (
                    <span>• {heroPhoto.focal_length}</span>
                  )}
                  {heroPhoto.aperture && <span>• {heroPhoto.aperture}</span>}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <Link
                href="/photos"
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-xs font-mono uppercase tracking-wider font-semibold transition-all hover:bg-white/90 active:scale-95 shadow-md"
              >
                <span>Explore Photographs</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white underline underline-offset-4 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
