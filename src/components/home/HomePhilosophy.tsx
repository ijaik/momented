import { ArrowRight } from "lucide-react";
import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
export default function HomePhilosophy() {
  return (
    <section
      aria-labelledby="philosophy-heading"
      className="border-t border-line/80 pt-16 sm:pt-20"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <div className="rounded-2xl border border-line/70 bg-surface/60 p-7 sm:p-8 shadow-xs">
          <SectionLabel>Open Access</SectionLabel>
          <h2
            id="philosophy-heading"
            className="mt-2 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink"
          >
            Public Domain Archive
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            All photographs on Momented are dedicated to the public domain under
            Creative Commons Zero (CC0). You are free to view, download, adapt,
            and use any image for personal, editorial, or commercial projects
            without permission, fees, or restrictions.
          </p>
        </div>
        <div className="rounded-2xl border border-line/70 bg-surface/60 p-7 sm:p-8 shadow-xs">
          <SectionLabel>Behind the Lens</SectionLabel>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
            A Study in Pause
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Momented is an ongoing pursuit of intentional stillness—letting
            morning shadows, raw architectural textures, and fleeting
            atmospheres speak without noise.
          </p>
          <div className="mt-5">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline underline-offset-4 active:scale-95"
            >
              <span>Read creator note &amp; camera gear</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
