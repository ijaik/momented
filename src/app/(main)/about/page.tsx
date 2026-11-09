import {
  ArrowRight,
  Camera,
  Check,
  Film,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import SectionLabel from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { aboutPageJsonLd, personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: "About Jai and Momented — A photography journal.",
  path: "/about",
});
export default function AboutPage() {
  return (
    <>
      <JsonLd data={[aboutPageJsonLd(), personJsonLd(), websiteJsonLd()]} />
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-360 py-8 sm:py-12 md:py-14">
        <header className="mb-14 border-b border-line/70 pb-12 md:mb-18 md:pb-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-signal/70" aria-hidden="true" />
            <span className="editorial-label text-signal/90 font-medium">
              About
            </span>
          </div>
          <h1 className="font-serif text-5xl font-medium leading-[1.03] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
            Hi, I&apos;m Jai.
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-xl font-light leading-relaxed text-ink/90 sm:text-2xl sm:leading-relaxed">
            I am not a photographer but I enjoy capturing moments, and Momented
            is where I put them together.
          </p>
        </header>
        <div className="flex flex-col gap-16 md:gap-20">
          <section className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-line/60 bg-surface/70 backdrop-blur-xs p-7 sm:p-8 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
              <div className="mb-3.5 flex items-center gap-2 text-ink">
                <Camera size={17} className="text-signal/90" />
                <SectionLabel>The Concept</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                <span className="font-serif text-ink">Momented</span> — a word I
                thought for a captured moment. Through it, I try to preserve the
                light, shadow, & the moments in between.
              </p>
            </div>
            <div className="rounded-2xl border border-line/60 bg-surface/70 backdrop-blur-xs p-7 sm:p-8 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
              <div className="mb-3.5 flex items-center gap-2 text-ink">
                <Layers size={17} className="text-signal/90" />
                <SectionLabel>The Idea</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                Photographs are meant to be shared. If you find a photograph you
                like, feel free to download and use it for personal or
                commercial projects without asking for permission.
              </p>
            </div>
          </section>
          <section className="border-t border-line/70 pt-12">
            <SectionLabel>Explore</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Link
                href="/series"
                className="group flex flex-col justify-between rounded-2xl border border-line/60 bg-surface/70 backdrop-blur-xs p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-line hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] active:scale-95"
              >
                <div>
                  <div className="text-muted group-hover:text-ink">
                    <Film size={18} className="text-signal/90" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-medium text-ink">
                    Series
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
                    Sequence of photographs exploring changes in light and
                    scenes.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 editorial-label text-signal/90 font-medium">
                  View series
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
              <Link
                href="/collections"
                className="group flex flex-col justify-between rounded-2xl border border-line/60 bg-surface/70 backdrop-blur-xs p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-line hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] active:scale-95"
              >
                <div>
                  <div className="text-muted group-hover:text-ink">
                    <Layers size={18} className="text-signal/90" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-medium text-ink">
                    Collections
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
                    Photographs grouped by atmosphere, texture, and mood.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 editorial-label text-signal/90 font-medium">
                  Browse collections
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
              <Link
                href="/photos"
                className="group flex flex-col justify-between rounded-2xl border border-line/60 bg-surface/70 backdrop-blur-xs p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-line hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] active:scale-95"
              >
                <div>
                  <div className="text-muted group-hover:text-ink">
                    <Camera size={18} className="text-signal/90" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-medium text-ink">
                    Photographs
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
                    Light, shadow, & the moments in between — one photograph at
                    a time.
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 editorial-label text-signal/90 font-medium">
                  Explore photographs
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </section>
          <section className="border-t border-line/70 pt-12">
            <SectionLabel>The License & Rights</SectionLabel>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-line/60 bg-surface/70 p-7 md:col-span-2 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
                <blockquote className="border-l-[3px] border-signal/70 pl-6 font-serif text-lg font-light leading-relaxed text-ink/90 md:text-xl">
                  &ldquo;{siteConfig.license}&rdquo;
                </blockquote>
                <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed">
                  Free for commercial, personal, and artistic use worldwide
                  without copyright restrictions.{" "}
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink"
                  >
                    Creative Commons CC0 1.0 Universal
                  </a>{" "}
                  does not affect third-party trademark or privacy rights.
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-line/60 bg-surface/70 p-7 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 text-ink">
                  <ShieldCheck size={18} className="text-signal/90" />
                  <span className="editorial-label text-muted font-medium">
                    License Summary
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5 text-xs font-mono text-muted">
                  <li className="flex items-center gap-2">
                    <Check
                      size={14}
                      className="text-signal shrink-0"
                      aria-hidden="true"
                    />
                    Free commercial use
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      size={14}
                      className="text-signal shrink-0"
                      aria-hidden="true"
                    />
                    No permission needed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      size={14}
                      className="text-signal shrink-0"
                      aria-hidden="true"
                    />
                    Direct downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <Check
                      size={14}
                      className="text-signal shrink-0"
                      aria-hidden="true"
                    />
                    Attribution appreciated
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-20 flex flex-col gap-3 border-t border-line/70 pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-serif text-sm italic text-muted">
            Living in the in-between.
          </p>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted transition-colors hover:text-ink"
          >
            <span>Jai on GitHub</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </>
  );
}
