import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { getSeriesList } from "@/lib/db/queries";
import { breadcrumbJsonLd, hubPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
export const metadata: Metadata = buildPageMetadata({
  title: "Series",
  description: "Sequence of photographs exploring changes in light and scenes.",
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
      <JsonLd
        data={[
          hubPageJsonLd({
            title: "Series",
            description:
              "Sequence of photographs exploring changes in light and scenes.",
            url: `${siteConfig.url}/series`,
            items: seriesList.map((series) => ({
              name: series.title,
              description: series.description,
              url: `${siteConfig.url}/series/${series.id}`,
              image: series.photos[0]?.cloudinary_url,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Series", url: `${siteConfig.url}/series` },
          ]),
        ]}
      />
      <PageHeader
        badge="03 / All Series"
        title="Series"
        description="Sequence of photographs exploring changes in light and scenes."
        meta={count > 0 ? `${count} series` : undefined}
      />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {seriesList.map((series) => (
            <CoverCard
              key={series.id}
              item={series}
              href={`/series/${series.id}`}
              meta={formatDisplayDate(series.created_at)}
              countLabel={{ singular: "photograph", plural: "photographs" }}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No series have been added yet." />
      )}
    </>
  );
}
