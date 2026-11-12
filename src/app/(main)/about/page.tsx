import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { aboutPageJsonLd, personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: "About Jai and Momented — A minimal photography journal.",
  path: "/about",
});
export default function AboutPage() {
  return (
    <>
      <JsonLd data={[aboutPageJsonLd(), personJsonLd(), websiteJsonLd()]} />
      <div className="py-8 sm:py-12 md:py-14">
        {/* Header */}
        <header className="border-b border-line/70 pb-12 sm:pb-16">
          <div className="mb-4 sm:mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-ink/70" aria-hidden="true" />
            <span className="editorial-label text-ink font-medium">
              About the Journal
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.03] tracking-tight text-ink font-normal">
            Hi, I&apos;m Jai.
          </h1>
          <p className="mt-6 sm:mt-8 max-w-2xl font-sans text-lg sm:text-xl leading-relaxed text-muted font-normal">
            I am not a photographer, but I enjoy capturing moments, and Momented
            is where I bring them together.
          </p>
        </header>
        {/* Asymmetric 12-Column Editorial Monograph */}
        <div className="divide-y divide-line/70">
          {/* Section 01: The Concept */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                01 / The Concept
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Light, shadow, and the moments in between.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6 text-[15px] sm:text-base leading-relaxed text-muted">
              <p>
                <strong className="font-normal font-serif text-ink">
                  Momented
                </strong>{" "}
                is a word I thought for a captured moment. Through it, I try to
                preserve the light, shadow, & the moments in between.
              </p>
              <p>
                The photographs in this journal are taken on everyday mobile
                devices, primarily a{" "}
                <span className="font-mono text-xs text-ink">moto g64 5G</span>,
                proving that honest composition and noticing the world require
                no grand studio gear.
              </p>
            </div>
          </section>
          {/* Section 02: Curatorial Structure */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                02 / Structure
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Three lenses of exploration.
              </h2>
            </div>
            <div className="md:col-span-8">
              <p className="text-[15px] sm:text-base leading-relaxed text-muted mb-8">
                The archive is structured around three curated perspectives
                rather than an endless algorithmic feed:
              </p>
              <div className="divide-y divide-line/60 border-y border-line/60">
                <Link
                  href="/series"
                  className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-4 transition-colors hover:text-ink"
                >
                  <div>
                    <h3 className="font-serif text-xl text-ink group-hover:underline underline-offset-4 decoration-line">
                      Series
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Sequence of photographs exploring changes in light and
                      scenes.
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted group-hover:text-ink">
                    <span>Explore</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
                <Link
                  href="/collections"
                  className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-4 transition-colors hover:text-ink"
                >
                  <div>
                    <h3 className="font-serif text-xl text-ink group-hover:underline underline-offset-4 decoration-line">
                      Collections
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Photographs grouped by atmosphere, texture, and mood.
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted group-hover:text-ink">
                    <span>Explore</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
                <Link
                  href="/collections/rules"
                  className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-4 transition-colors hover:text-ink"
                >
                  <div>
                    <h3 className="font-serif text-xl text-ink group-hover:underline underline-offset-4 decoration-line">
                      Compositional Rules
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Photographs by rule of thirds, leading lines, framing, and
                      more.
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted group-hover:text-ink">
                    <span>Explore</span>
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            </div>
          </section>
          {/* Section 03: Public Domain & License */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                03 / Public Domain
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Open Creative Commons CC0.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6">
              <blockquote className="border-l-2 border-ink pl-6 font-serif text-xl leading-relaxed text-ink/90 sm:text-2xl font-normal">
                &ldquo;{siteConfig.license}&rdquo;
              </blockquote>
              <p className="text-[15px] sm:text-base leading-relaxed text-muted">
                Every photograph in Momented is freely dedicated to the public
                domain. You may download, modify, distribute, and use them for
                personal or commercial purposes worldwide without requesting
                permission or paying royalties.
              </p>
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-muted">
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Free for commercial use
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  No permission or licensing required
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Direct downloads
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Attribution appreciated, never required
                </li>
              </ul>
              <div className="pt-2">
                <a
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  <span>Read Creative Commons CC0 1.0 Universal</span>
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>
        {/* Colophon */}
        <div className="mt-16 sm:mt-20 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-t border-line/70 pt-8">
          <p className="font-serif text-base text-muted">
            Living in the in-between.
          </p>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            <span>Jai on GitHub</span>
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}
