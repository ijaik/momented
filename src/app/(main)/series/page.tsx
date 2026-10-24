import type { Metadata } from "next";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getSeriesList } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
export const metadata: Metadata = buildPageMetadata({
  title: "Series",
  description:
    "Ordered sequences of moments captured in the same frame of time — continuous visual narratives on Momented.",
  path: "/series",
});
interface RawSeriesPhoto {
  position: number;
  photos: {
    id: string;
    title: string | null;
    cloudinary_url: string;
    width: number;
    height: number;
  } | null;
}
export default async function SeriesPage() {
  const { data: rawSeries } = await getSeriesList();
  const seriesList = (rawSeries || []).map((s) => {
    const rawPhotos = (s.series_photos as unknown as RawSeriesPhoto[]) || [];
    const sortedPhotos = [...rawPhotos]
      .sort((a, b) => a.position - b.position)
      .map((sp) => sp.photos)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      cover_photo_id: s.cover_photo_id,
      created_at: s.created_at,
      photos: sortedPhotos,
    };
  });
  const count = seriesList.length;
  return (
    <>
      <PageHeader
        title="Series"
        description="Ordered sequences of moments captured in the same continuum of light, movement, and time."
        meta={count > 0 ? `${count} series` : undefined}
      />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {seriesList.map((series, index) => (
            <CoverCard
              key={series.id}
              item={series}
              href={`/series/${series.id}`}
              index={index}
              meta={formatDisplayDate(series.created_at)}
              countLabel={{ singular: "frame", plural: "frames" }}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No photo series have been curated yet." />
      )}
    </>
  );
}
