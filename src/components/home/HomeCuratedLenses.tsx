import { Compass } from "lucide-react";
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
      className="border-t border-line/80 pt-16 sm:pt-20"
    >
      <SectionHeader
        label="02 / Collections"
        icon={Compass}
        title="Three ways to explore"
        description="Photographs organized by theme, rules and months."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              By Atmosphere
            </span>
            <Link
              href="/collections"
              className="text-xs font-medium text-signal hover:underline active:scale-95"
            >
              All themes →
            </Link>
          </div>
          {featuredCollection ? (
            <CoverCard
              item={featuredCollection}
              href={`/collections/${featuredCollection.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
              No collections yet
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              By Technique
            </span>
            <Link
              href="/collections/rules"
              className="text-xs font-medium text-signal hover:underline active:scale-95"
            >
              All rules →
            </Link>
          </div>
          {featuredRule ? (
            <CoverCard
              item={featuredRule}
              href={`/collections/rules/${featuredRule.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
              No rule collections yet
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              By Season
            </span>
            <Link
              href="/collections/calendar"
              className="text-xs font-medium text-signal hover:underline active:scale-95"
            >
              Full calendar →
            </Link>
          </div>
          {featuredCalendar ? (
            <CoverCard
              item={featuredCalendar}
              href={`/collections/calendar/${featuredCalendar.id}`}
              aspectRatio="4/3"
            />
          ) : (
            <div className="rounded-xl border border-line bg-soft p-8 text-center text-sm text-muted">
              No calendar collections yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
