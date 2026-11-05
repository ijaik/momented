import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import SeriesCarousel from "@/components/series/SeriesCarousel";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { siteConfig } from "@/config/site";
import { getAllIds, getSeriesById } from "@/lib/db/queries";
import { breadcrumbJsonLd, seriesPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo, SeriesSlidePhoto } from "@/types";
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("series");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  if (id === "_")
    return {
      title: "Series Not Found",
      robots: { index: false, follow: false },
    };
  const { data: series } = await getSeriesById(id);
  if (!series)
    return {
      title: "Series Not Found",
      robots: { index: false, follow: false },
    };
  const title = series.title || "Photo Series";
  const description =
    series.description ||
    `Explore "${title}" — a multi-photo series on ${siteConfig.name}.`;
  const rawPhotos =
    (series.series_photos as unknown as {
      position: number;
      photos: Photo;
    }[]) || [];
  const firstPhoto = [...rawPhotos].sort((a, b) => a.position - b.position)[0]
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
async function SeriesDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "_") notFound();
  const { data: series } = await getSeriesById(id);
  if (!series) notFound();
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
      <DetailLayout
        badge="Visual Sequence"
        backLink={{ href: "/series", label: "All Series" }}
        title={series.title}
        description={series.description}
        meta={`${sortedPhotos.length} ${sortedPhotos.length === 1 ? "frame" : "frames"} • ${displayDate}`}
      >
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
      </DetailLayout>
    </>
  );
}
export default function SeriesDetailPage({
  params,
}: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<Skeleton variant="series" />}>
      <SeriesDetailContent params={params} />
    </Suspense>
  );
}
