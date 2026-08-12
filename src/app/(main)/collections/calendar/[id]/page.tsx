import PhotoGrid from "@/components/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { getPhotoDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
import type { PageProps, Photo } from "@/types";

type CalendarPhoto = Photo & {
  dayContext?: { current: number; total: number } | null;
};
type GroupedPhotos = Record<number, Record<string, Photo[]>>;
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { data } = await supabase.from("calendar_collections").select("id");
  return (data ?? []).map((collection) => ({ id: String(collection.id) }));
}
export default async function CalendarMonthPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return <EmptyState description="Invalid month requested." />;
  const [{ data: collection }, { data: monthPhotosData }] = await Promise.all([
    supabase
      .from("calendar_collections")
      .select("title, description")
      .eq("id", monthIndex)
      .single(),
    supabase
      .from("photos")
      .select(
        "id, title, cloudinary_url, width, height, camera_model, taken_at, created_at, photo_calendar_collections!inner(calendar_id)",
      )
      .eq("photo_calendar_collections.calendar_id", monthIndex)
      .order("created_at", { ascending: false }),
  ]);
  if (!collection) return <EmptyState description="Month not found." />;
  const monthPhotos = monthPhotosData || [];
  const groupedByYear = monthPhotos.reduce<GroupedPhotos>((acc, photo) => {
    const { year, dateString } = getPhotoDate(photo);
    if (!acc[year]) acc[year] = {};
    if (!acc[year][dateString]) acc[year][dateString] = [];
    acc[year][dateString].push(photo);
    return acc;
  }, {});
  const structuredYears = Object.keys(groupedByYear)
    .sort((a, b) => Number(b) - Number(a))
    .map((yearKey) => {
      const year = Number(yearKey);
      const photosForYear: CalendarPhoto[] = [];
      const sortedDays = Object.keys(groupedByYear[year]).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      );
      sortedDays.forEach((dateString) => {
        const dayPhotos = groupedByYear[year][dateString];
        const isDense = dayPhotos.length > 2;
        dayPhotos.forEach((photo, index) => {
          photosForYear.push({
            ...photo,
            dayContext: isDense
              ? { current: index + 1, total: dayPhotos.length }
              : null,
          });
        });
      });
      return { year, photos: photosForYear };
    });
  return (
    <DetailLayout title={collection.title} description={collection.description}>
      {structuredYears.length > 0 ? (
        <div className="flex flex-col gap-24 pb-24">
          {structuredYears.map(({ year, photos }) => (
            <section key={year}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                {collection.title} {year}
              </h2>
              <PhotoGrid photos={photos} />
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          description={`No photos have been captured in ${collection.title} yet.`}
          className="border-none py-20 border-t border-t-zinc-200 dark:border-t-zinc-800 rounded-none"
        />
      )}
    </DetailLayout>
  );
}
