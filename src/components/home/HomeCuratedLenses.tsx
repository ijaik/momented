import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import CoverCard from "@/components/ui/CoverCard";
import SectionHeader from "@/components/ui/SectionHeader";
import type { HomeEditorialData } from "@/lib/db/queries";

interface HomeCuratedLensesProps {
  featuredCollection: HomeEditorialData["featuredCollection"];
  featuredRule: HomeEditorialData["featuredRule"];
  featuredCalendar: HomeEditorialData["featuredCalendar"];
}
export default function HomeCuratedLenses({
  featuredCollection,
  featuredRule,
  featuredCalendar,
}: HomeCuratedLensesProps) {
  return (
    <section
      id="perspectives"
      aria-labelledby="perspectives-heading"
      className="border-t border-line/70 pt-16 sm:pt-24"
    >
      <SectionHeader
        label="02 / Perspectives"
        icon={Compass}
        title="Three ways to explore"
        description="Photographs organized by atmosphere, photographic rules, and months."
      />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="editorial-label text-muted">By Atmosphere</span>
            <Link
              href="/collections"
              className="group/link inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors active:scale-95"
            >
              <span>All themes</span>
              <ArrowRight
                size={11}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          {featuredCollection ? (
            <CoverCard
              item={featuredCollection}
              href={`/collections/${featuredCollection.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-2xl border border-line bg-soft/50 p-8 text-center text-xs font-mono text-muted">
              No collections yet
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="editorial-label text-muted">By Technique</span>
            <Link
              href="/collections/rules"
              className="group/link inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors active:scale-95"
            >
              <span>All rules</span>
              <ArrowRight
                size={11}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          {featuredRule ? (
            <CoverCard
              item={featuredRule}
              href={`/collections/rules/${featuredRule.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-2xl border border-line bg-soft/50 p-8 text-center text-xs font-mono text-muted">
              No rule collections yet
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="editorial-label text-muted">By Season</span>
            <Link
              href="/collections/calendar"
              className="group/link inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors active:scale-95"
            >
              <span>Full calendar</span>
              <ArrowRight
                size={11}
                className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          {featuredCalendar ? (
            <CoverCard
              item={featuredCalendar}
              href={`/collections/calendar/${featuredCalendar.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-2xl border border-line bg-soft/50 p-8 text-center text-xs font-mono text-muted">
              No calendar collections yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
