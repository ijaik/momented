import Link from "next/link";
import CoverCard from "@/components/ui/CoverCard";
import PageHeader from "@/components/ui/PageHeader";
import { getPhotoDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
export const metadata = { title: "Collections" };
export default async function CollectionsPage({ searchParams }) {
  const { tab } = await searchParams;
  const isCalendar = tab === "calendar";
  const [
    { data: curatedCollections },
    { data: calendarData },
    { data: allPhotos },
  ] = await Promise.all([
    supabase
      .from("collections")
      .select(
        "id, title, cover_photo_id, created_at, photos!collection_id(id, cloudinary_url)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("calendar_collections")
      .select("*")
      .order("id", { ascending: true }),
    supabase.from("photos").select("id, taken_at, created_at, cloudinary_url"),
  ]);
  const calendarCollections =
    calendarData?.map((month) => {
      const monthPhotos =
        allPhotos?.filter((p) => getPhotoDate(p).month === month.id) || [];
      const customCover = allPhotos?.find((p) => p.id === month.cover_photo_id);
      const primaryCover = customCover || monthPhotos[0];
      let sortedPhotos = [...monthPhotos];
      if (primaryCover && sortedPhotos.some((p) => p.id === primaryCover.id)) {
        sortedPhotos = [
          primaryCover,
          ...sortedPhotos.filter((p) => p.id !== primaryCover.id),
        ];
      } else if (primaryCover) {
        sortedPhotos = [primaryCover, ...sortedPhotos];
      }
      return {
        ...month,
        id: month.id.toString(),
        photos: sortedPhotos.map((p) => ({
          id: p.id,
          cloudinary_url: p.cloudinary_url,
        })),
      };
    }) || [];
  const activeCalendarCollections = calendarCollections.filter(
    (col) => col.photos.length > 0,
  );
  const displayCollections = isCalendar
    ? activeCalendarCollections
    : curatedCollections;
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
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 mb-10 pb-4">
        <Link
          href="/collections"
          className={`text-lg font-bold px-4 py-2 rounded-lg transition-colors ${
            !isCalendar
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900"
          }`}
        >
          Curated
        </Link>
        <Link
          href="/collections?tab=calendar"
          className={`text-lg font-bold px-4 py-2 rounded-lg transition-colors ${
            isCalendar
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900"
          }`}
        >
          Calendar
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayCollections?.map((col, index) => (
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
    </main>
  );
}
