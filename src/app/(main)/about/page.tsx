import type { Metadata } from "next";
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
  return <h2 className="mb-6 text-sm font-medium text-ink">{children}</h2>;
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
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
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
          <section className="grid grid-cols-1 gap-x-16 gap-y-14 sm:grid-cols-2">
            <div>
              <SectionLabel>The concept</SectionLabel>
              <p className="text-[15px] leading-relaxed text-muted">
                <span className="font-medium font-script text-ink">
                  Momented
                </span>{" "}
                — the word I use for a captured moment.
                <span className="mt-1 block">
                  Through it, I preserve the quiet conversations between light,
                  shadow, and time.
                </span>
              </p>
            </div>
            <div>
              <SectionLabel>The purpose</SectionLabel>
              <p className="text-[15px] leading-relaxed text-muted">
                Art is meant to be shared, not locked away.
                <span className="mt-1 block">
                  Take these moments wherever they feel at home.
                </span>
              </p>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>The license</SectionLabel>
            <p className="border-l-2 border-line pl-6 font-serif text-lg font-light leading-relaxed text-ink/90 md:text-xl">
              {siteConfig.license}
            </p>
          </section>
        </div>
        <div className="mt-20 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          {" "}
          <p className="text-sm italic text-muted">Living in the in-between.</p>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted underline decoration-line decoration-[1.5px] underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Jai on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
