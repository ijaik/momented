import { ArrowUpRight, Camera, Film, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
export const metadata: Metadata = {
  title: "About",
  description:
    "Hi, I'm Jai — an observer behind the lens, making a quiet record of light, shadow, and the moments in between.",
  alternates: { canonical: "/about" },
};
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-mono uppercase tracking-widest text-signal">
      {children}
    </h2>
  );
}
export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-24">
      <JsonLd data={[personJsonLd(), websiteJsonLd()]} />
      <div className="max-w-3xl">
        <header className="mb-16 border-b border-line pb-14 md:mb-20 md:pb-16">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-soft/70 px-3.5 py-1 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse"
            />
            <span>Behind the lens</span>
          </div>
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Hi, I&apos;m Jai.
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-xl font-light leading-relaxed text-ink/90 sm:text-2xl sm:leading-relaxed">
            {siteConfig.author.role} — making a quiet record of light, shadow,
            and the moments in between.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            Every photograph is a study in pause — letting textures, geometries,
            and fleeting atmospheres speak for themselves.
          </p>
        </header>
        <div className="flex flex-col gap-16 md:gap-20">
          <section className="grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2">
            <div className="rounded-xl border border-line/70 bg-surface/40 p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <Camera size={18} className="text-signal" />
                <SectionLabel>The Concept</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                <span className="font-serif italic text-ink">Momented</span> —
                the term for a captured moment. Through it, I preserve the quiet
                conversations between natural light, urban shadow, and time.
              </p>
            </div>
            <div className="rounded-xl border border-line/70 bg-surface/40 p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <Layers size={18} className="text-signal" />
                <SectionLabel>The Philosophy</SectionLabel>
              </div>
              <p className="text-[15px] leading-relaxed text-muted">
                Art is meant to be shared, lived with, and explored. Take these
                high-resolution visual records wherever they bring a moment of
                stillness to your day.
              </p>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>Explore the Work</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/series"
                className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition-all hover:border-ink/20 hover:bg-soft"
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
                    Curated Series
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Sequential cinematic photographic narratives.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  View series →
                </span>
              </Link>
              <Link
                href="/collections"
                className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition-all hover:border-ink/20 hover:bg-soft"
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
                    Thematic archives grouped by subject and mood.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  Browse collections →
                </span>
              </Link>
              <Link
                href="/"
                className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition-all hover:border-ink/20 hover:bg-soft"
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
                    Full Archive
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    The complete chronological journal of moments.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  Explore archive →
                </span>
              </Link>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>The License</SectionLabel>
            <blockquote className="mt-4 border-l-2 border-signal/60 pl-6 font-serif text-lg font-light leading-relaxed text-ink/90 md:text-xl">
              &ldquo;{siteConfig.license}&rdquo;
            </blockquote>
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
    </main>
  );
}
