import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
export default function Footer() {
  return (
    <footer className="border-t border-line/70 mt-auto bg-surface/30 backdrop-blur-2xs">
      <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-12 sm:px-8 sm:pt-16 sm:pb-14 xl:max-w-7xl 2xl:max-w-360">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-85 active:scale-95"
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line/80 bg-surface shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src="/icons/favicon.svg"
                    alt="Momented logo"
                    width={28}
                    height={28}
                    unoptimized
                  />
                </span>
                <span className="font-serif text-2xl tracking-tight text-ink">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed text-muted">
                {siteConfig.description}
              </p>
            </div>
          </div>
          <div className="md:col-span-3">
            <span className="editorial-label text-ink font-semibold">
              Journal
            </span>
            <ul className="mt-4 space-y-2.5 text-xs font-medium uppercase tracking-wider text-muted">
              <li>
                <Link
                  href="/photos"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  Photographs
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/series"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  Series
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/calendar"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  Calendar Months
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <span className="editorial-label text-ink font-semibold">
              Curations &amp; Info
            </span>
            <ul className="mt-4 space-y-2.5 text-xs font-medium uppercase tracking-wider text-muted">
              <li>
                <Link
                  href="/collections/rules"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  Composition Rules
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  About the Journal
                </Link>
              </li>
              <li>
                <a
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  <span>License (CC0 1.0)</span>
                  <ArrowUpRight size={10} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.author.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink hover:underline underline-offset-4"
                >
                  <span>GitHub</span>
                  <ArrowUpRight size={10} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 pt-6 border-t border-line/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-muted">
          <p className="journal-caption text-muted/80">
            Dedicated to public domain under Creative Commons CC0 1.0.
          </p>
          <p className="journal-caption inline-flex items-center gap-1">
            <span>Momented with</span>
            <Heart
              size={11}
              className="text-signal/90 fill-signal/80 shrink-0 inline"
              aria-label="love"
            />
            <span>by Jai</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
