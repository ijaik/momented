import Link from "next/link";
import CoverCard from "@/components/ui/CoverCard";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
export const metadata = { title: "Collections" };
export default async function CollectionsPage({ searchParams }) {
  const { tab } = await searchParams;
  const isCalendar = tab === "calendar";
  const [{ data: curatedCollections }, { data: calendarCollections }] =
    await Promise.all([
      supabase
        .from("collections")
        .select("*, photos!photo_collections(id, cloudinary_url)")
        .order("created_at", { ascending: false }),
      supabase
        .from("calendar_collections")
        .select("*, photos!photo_calendar_collections(id, cloudinary_url)")
        .order("id", { ascending: true }),
    ]);

  const activeCalendarCollections = (calendarCollections || []).filter(
    (col) => col.photos && col.photos.length > 0,
  );
  const displayCollections = isCalendar
    ? activeCalendarCollections
    : curatedCollections;
  const tabs = [
    { name: "Curated", href: "/collections", isActive: !isCalendar },
    {
      name: "Calendar",
      href: "/collections?tab=calendar",
      isActive: isCalendar,
    },
  ];
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <PageHeader
        title="Collections"
        subtitle={
          <>
            Collections of{" "}
            <span className="font-leckerli tracking-tight">Momented</span>.
          </>
        }
      />
      <div className="w-full mb-10">
        <nav
          className="flex w-full border-b border-zinc-200 dark:border-zinc-800"
          aria-label="Collection views"
        >
          {tabs.map((tabItem) => (
            <Link
              key={tabItem.name}
              href={tabItem.href}
              aria-current={tabItem.isActive ? "page" : undefined}
              className={`w-1/2 text-center py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tabItem.isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 dark:hover:text-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {tabItem.name}
            </Link>
          ))}
        </nav>
      </div>
      {displayCollections && displayCollections.length > 0
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayCollections.map((col, index) => (
              <CoverCard
                key={col.id}
                item={col}
                href={
                  isCalendar
                    ? `/collections/calendar/${col.id}`
                    : `/collections/${col.id}`
                }
                index={index}
              />
            ))}
          </div>
        : <div className="text-center py-20 px-6 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl text-zinc-500 dark:text-zinc-400">
            No collections found for this view.
          </div>}
    </main>
  );
}
