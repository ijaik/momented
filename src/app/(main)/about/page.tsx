import type { Metadata } from "next";
import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
export const metadata: Metadata = {
  title: "About",
  description:
    "Hi, I'm Jai — an observer and narrator. The perspective is mine; AI helps express it.",
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
        <header className="mb-16 md:mb-24">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Hi, I&apos;m Jai.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            {siteConfig.author.role} — I make a quiet record of light, shadow,
            and the moments in between.
          </p>
          <p className="mt-3 max-w-xl text-lg italic text-muted">
            The perspective is mine; AI helps me put it into words.
          </p>
        </header>
        <div className="flex flex-col gap-16 md:gap-20">
          <section className="grid grid-cols-1 gap-x-16 gap-y-14 sm:grid-cols-2">
            <div>
              <SectionLabel>The concept</SectionLabel>
              <p className="text-muted">
                <span className="text-ink">Momented</span> — the word I use for
                a captured moment. Through it, I preserve the quiet
                conversations between light, shadow, and time.
              </p>
            </div>
            <div>
              <SectionLabel>The purpose</SectionLabel>
              <p className="text-muted">
                Art is meant to be shared, not locked away. Take these moments
                wherever they feel at home.
              </p>
            </div>
          </section>
          <section className="border-t border-line pt-12">
            <SectionLabel>The license</SectionLabel>
            <p className="border-l-2 border-line pl-6 text-lg font-serif font-light leading-relaxed text-ink/90 md:text-xl">
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
