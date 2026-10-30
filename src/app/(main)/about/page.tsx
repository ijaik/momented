import {
  ArrowUpRight,
  Camera,
  Film,
  HelpCircle,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import {
  aboutPageJsonLd,
  faqPageJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

const FAQS = [
  {
    question: "What is Momented?",
    answer:
      "Momented is an independent minimalist photography journal and open visual archive created by Jai, dedicated to capturing quiet studies in light, shadow, urban textures, and moments in between.",
  },
  {
    question:
      "Are photographs on Momented free for commercial and personal use?",
    answer:
      "Yes. All photographs on Momented are released under Creative Commons CC0 1.0 Universal Public Domain Dedication. You are free to view, download, adapt, and use them for personal, editorial, or commercial projects without permission or cost.",
  },
  {
    question: "Is attribution required when using Momented photos?",
    answer:
      "Attribution is not legally required under the CC0 dedication, but mentioning 'Jai / Momented' or linking back to https://momented.vercel.app is appreciated whenever you share the work.",
  },
  {
    question: "What camera gear and technical settings are used?",
    answer:
      "Photographs are captured across varied camera systems and prime lenses. Full technical exposure data—including camera model, focal length, aperture, shutter speed, and ISO—is preserved in the EXIF metadata on each photograph's view page.",
  },
  {
    question: "How can I download the highest resolution file?",
    answer:
      "Open any individual photograph and select 'Download' in the details panel to save the original high-resolution uncompressed file directly to your device.",
  },
];
export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "Hi, I'm Jai — an observer behind the lens, making a quiet record of light, shadow, and the moments in between on Momented. Free high-resolution CC0 photography.",
  path: "/about",
});
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-mono uppercase tracking-widest text-signal">
      {children}
    </h2>
  );
}
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageJsonLd(),
          personJsonLd(),
          websiteJsonLd(),
          faqPageJsonLd(FAQS),
        ]}
      />
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-360 py-16 md:py-24">
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
            <div className="rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-md p-6 sm:p-7 shadow-xs">
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
            <div className="rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-md p-6 sm:p-7 shadow-xs">
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
                    Thematic archives grouped by subject and mood.
                  </p>
                </div>
                <span className="mt-4 text-xs font-mono text-signal">
                  Browse collections →
                </span>
              </Link>
              <Link
                href="/"
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
            <SectionLabel>The License & Rights</SectionLabel>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-line/70 bg-surface/50 p-6 md:col-span-2">
                <blockquote className="border-l-2 border-signal/60 pl-6 font-serif text-lg font-light leading-relaxed text-ink/90 md:text-xl">
                  &ldquo;{siteConfig.license}&rdquo;
                </blockquote>
                <p className="mt-4 text-xs text-muted leading-relaxed">
                  Dedicated under{" "}
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink"
                  >
                    Creative Commons CC0 1.0 Universal
                  </a>
                  . Free for commercial, personal, and artistic use worldwide.
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
                    <span className="text-signal">✓</span> Full original
                    resolution
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-signal">✓</span> Attribution
                    appreciated
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <div className="mb-6 flex items-center gap-2">
              <HelpCircle size={18} className="text-signal" />
              <SectionLabel>Frequently Asked Questions</SectionLabel>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {FAQS.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-md p-6 sm:p-7 shadow-xs"
                >
                  <h3 className="font-serif text-lg font-medium text-ink">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                </article>
              ))}
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
