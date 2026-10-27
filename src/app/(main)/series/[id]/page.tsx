import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import SeriesCarousel from "@/components/series/SeriesCarousel";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import { getAllIds, getSeriesById } from "@/lib/db/queries";
import { breadcrumbJsonLd, seriesPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo, SeriesSlidePhoto } from "@/types";
export const instant = false;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("series");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_") return { title: "Series" };
  const { data: series } = await getSeriesById(id);
  if (!series) return { title: "Series Not Found" };
  const title = series.title || "Photo Series";
  const description =
    series.description ||
    `Explore "${title}" — a multi-photo series on ${siteConfig.name}.`;
  const rawPhotos =
    (series.series_photos as unknown as {
      position: number;
      photos: Photo;
    }[]) || [];
  const firstPhoto = rawPhotos.sort((a, b) => a.position - b.position)[0]
    ?.photos;
  return buildPageMetadata({
    title,
    description,
    path: `/series/${id}`,
    imageUrl: firstPhoto?.cloudinary_url,
  });
}
interface RawSeriesPhotoJoin {
  position: number;
  photos: Photo | null;
}
export default async function SeriesDetailPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  if (id === "_") return <EmptyState description="No series curated yet." />;
  const { data: series } = await getSeriesById(id);
  if (!series) return <EmptyState description="Series not found." />;
  const rawPhotos =
    (series.series_photos as unknown as RawSeriesPhotoJoin[]) || [];
  const sortedPhotos: SeriesSlidePhoto[] = [...rawPhotos]
    .sort((a, b) => a.position - b.position)
    .filter((sp): sp is { position: number; photos: Photo } =>
      Boolean(sp.photos),
    )
    .map((sp) => ({
      ...sp.photos,
      position: sp.position,
    }));
  const url = `${siteConfig.url}/series/${id}`;
  const displayDate = formatDisplayDate(series.created_at);
  return (
    <>
      <JsonLd
        data={[
          seriesPageJsonLd(series, url, sortedPhotos),
          breadcrumbJsonLd([
            { name: "Series", url: `${siteConfig.url}/series` },
            { name: series.title, url },
          ]),
        ]}
      />
      <header className="my-8 md:my-10 max-w-3xl border-b border-line pb-8">
        <h1 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-5xl">
          {series.title}
        </h1>
        {series.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
            {series.description}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">Curated on {displayDate}</p>
      </header>
      {sortedPhotos.length > 0 ? (
        <SeriesCarousel
          seriesTitle={series.title}
          seriesDescription={series.description}
          photos={sortedPhotos}
          createdAt={displayDate}
        />
      ) : (
        <EmptyState description="No photographs added to this series yet." />
      )}
    </>
  );
}
