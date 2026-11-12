import { ArrowRight } from "lucide-react";
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
  const lenses = [
    {
      key: "atmosphere",
      label: "By Atmosphere",
      href: "/collections",
      linkLabel: "All themes",
      basePath: "/collections",
      item: featuredCollection,
      empty: "No collections yet",
    },
    {
      key: "technique",
      label: "By Technique",
      href: "/collections/rules",
      linkLabel: "All rules",
      basePath: "/collections/rules",
      item: featuredRule,
      empty: "No rule collections yet",
    },
    {
      key: "season",
      label: "By Season",
      href: "/collections/calendar",
      linkLabel: "Full calendar",
      basePath: "/collections/calendar",
      item: featuredCalendar,
      empty: "No calendar collections yet",
    },
  ];
  return (
    <section
      id="perspectives"
      aria-labelledby="perspectives-heading"
      className="border-t border-line/70 pt-12.5 sm:pt-18.75 md:pt-25"
    >
      <SectionHeader
        id="perspectives-heading"
        label="02 / Perspectives"
        title="Three ways to explore"
        description="Photographs organized by atmosphere, photographic rules, and months."
      />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {lenses.map(
          ({ key, label, href, linkLabel, basePath, item, empty }) => (
            <div key={key} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="editorial-label text-muted">{label}</span>
                <Link
                  href={href}
                  className="group/link inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted hover:text-ink transition-colors"
                >
                  <span>{linkLabel}</span>
                  <ArrowRight
                    size={11}
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              {item ? (
                <CoverCard
                  item={item}
                  href={`${basePath}/${item.id}`}
                  aspectRatio="4/3"
                />
              ) : (
                <div className="rounded-xs border border-line bg-soft/50 p-8 text-center text-xs text-muted">
                  {empty}
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </section>
  );
}
