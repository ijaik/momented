import PhotoCard from "@/components/PhotoCard";
import BackButton from "@/components/ui/BackButton";
import { getPhotoDate } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabase";
export default async function CalendarMonthPage({ params }) {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  const [{ data: collection }, { data: allPhotos }] = await Promise.all([
    supabase
      .from("calendar_collections")
      .select("title, description")
      .eq("id", monthIndex)
      .single(),
    supabase
      .from("photos")
      .select(
        "id, title, cloudinary_url, width, height, camera_model, taken_at, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);
  if (!collection)
    return <div className="p-20 text-center text-xl">Month not found.</div>;
  const monthPhotos =
    allPhotos?.filter((p) => getPhotoDate(p).month === monthIndex) || [];
  const groupedByYear = monthPhotos.reduce((acc, photo) => {
    const { year, dateString } = getPhotoDate(photo);
    if (!acc[year]) acc[year] = {};
    if (!acc[year][dateString]) acc[year][dateString] = [];
    acc[year][dateString].push(photo);
    return acc;
  }, {});
  const structuredYears = Object.keys(groupedByYear)
    .sort((a, b) => b - a)
    .map((year) => {
      const photosForYear = [];
      const sortedDays = Object.keys(groupedByYear[year]).sort(
        (a, b) => new Date(b) - new Date(a),
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
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton href="/collections?tab=calendar" label="Back to Calendar" />
        <header className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed whitespace-pre-wrap">
              {collection.description}
            </p>
          )}
        </header>
        {structuredYears.length > 0
          ? <div className="flex flex-col gap-24 pb-24">
              {structuredYears.map(({ year, photos }) => (
                <section key={year}>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    {collection.title} {year}
                  </h2>
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {photos.map((photo, index) => (
                      <PhotoCard key={photo.id} photo={photo} index={index} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          : <div className="text-center text-zinc-500 py-20 border-t border-zinc-200 dark:border-zinc-800">
              No photos have been captured in {collection.title} yet.
            </div>}
      </div>
    </main>
  );
}
