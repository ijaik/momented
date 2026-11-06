import { ArrowUpRight, Camera, Film, Layers, ShieldCheck } from "lucide-react";
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
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-360 py-10 sm:py-14 md:py-16">
        <header className="mb-16 border-b border-line pb-14 md:mb-20 md:pb-16">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-soft/70 px-3.5 py-1 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
            />
            <span>About</span>
          </div>
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Hi, I&apos;m Jai.
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-xl font-light leading-relaxed text-ink/90 sm:text-2xl sm:leading-relaxed">
            I am not a photographer but I enjoy capturing moments, and Momented
            is where I put them together.
          </p>
        </header>
        <div className="flex flex-col gap-16 md:gap-20">
          <section className="grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2">
            <div className="rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-md p-6 sm:p-7 shadow-xs">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <Camera size={18} className="text-signal" />
                <SectionLabel>The Concept</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                <span className="font-serif text-ink">Momented</span> — a word I
                thought for a captured moment. Through it, I try to preserve the
                light, shadow, & the moments in between.
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-md p-6 sm:p-7 shadow-xs">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <Layers size={18} className="text-signal" />
                <SectionLabel>The Idea</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                Photographs are meant to be shared. If you find a photograph you
                like, feel free to download and use it for personal or
                commercial projects without asking for permission.
              </p>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>Explore</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/series"
                className="group flex flex-col justify-between rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-md p-6 transition-all hover:border-ink/20 hover:bg-soft/70 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between text-muted group-hover:text-ink">
                    <Film size={20} className="text-signal" />
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-medium text-ink">
                    Series
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Sequence of photographs exploring changes in light and
                    scenes.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  View series →
                </span>
              </Link>
              <Link
                href="/collections"
                className="group flex flex-col justify-between rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-md p-6 transition-all hover:border-ink/20 hover:bg-soft/70 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between text-muted group-hover:text-ink">
                    <Layers size={20} className="text-signal" />
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-medium text-ink">
                    Collections
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Photographs grouped by atmosphere, texture, and mood.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  Browse collections →
                </span>
              </Link>
              <Link
                href="/photos"
                className="group flex flex-col justify-between rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-md p-6 transition-all hover:border-ink/20 hover:bg-soft/70 active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between text-muted group-hover:text-ink">
                    <Camera size={20} className="text-signal" />
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-medium text-ink">
                    Photographs
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Light, shadow, & the moments in between — one photograph at
                    a time.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  Explore photographs →
                </span>
              </Link>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>The License & Rights</SectionLabel>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-line/70 bg-surface/50 p-6 md:col-span-2">
                <blockquote className="border-l-2 border-signal/60 pl-6 font-serif text-lg font-light leading-relaxed text-ink/90 md:text-xl">
                  &ldquo;{siteConfig.license}&rdquo;
                </blockquote>
                <p className="mt-4 text-xs text-muted leading-relaxed">
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
              <div className="flex flex-col justify-center rounded-2xl border border-line/70 bg-surface/50 p-6">
                <div className="flex items-center gap-2 text-ink">
                  <ShieldCheck size={18} className="text-signal" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted">
                    License Summary
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <span className="text-signal">✓</span> Free commercial use
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-signal">✓</span> No permission needed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-signal">✓</span> Direct downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-signal">✓</span> Attribution
                    appreciated
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        <div className="mt-20 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-baseline sm:justify-between">
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
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </>
  );
}
