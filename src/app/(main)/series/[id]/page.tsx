import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import SeriesCarousel from "@/components/series/SeriesCarousel";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { siteConfig } from "@/config/site";
import { getAllIds, getSeriesById } from "@/lib/db/queries";
import { breadcrumbJsonLd, seriesPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import { extractSortedSeriesPhotos } from "@/lib/utils/series";
import { isValidUUID } from "@/lib/utils/validation";
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
  if (!isValidUUID(id))
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
  const title = series.title || "Series";
  const description =
    series.description ||
    `Explore "${title}" — a series on ${siteConfig.name}.`;
  const rawPhotos =
    (series.series_photos as unknown as {
      position: number;
      photos: Photo | null;
    }[]) || [];
  const firstPhoto = extractSortedSeriesPhotos(rawPhotos)[0];
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
  if (!isValidUUID(id)) notFound();
  const { data: series } = await getSeriesById(id);
  if (!series) notFound();
  const rawPhotos =
    (series.series_photos as unknown as RawSeriesPhotoJoin[]) || [];
  const sortedPhotos: SeriesSlidePhoto[] = extractSortedSeriesPhotos(
    rawPhotos,
  ).map((photo, position) => ({
    ...photo,
    position,
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
      <PageHeader
        badge="Series"
        backLink={{ href: "/series", label: "All Series" }}
        title={series.title}
        description={series.description}
        meta={`${sortedPhotos.length} ${sortedPhotos.length === 1 ? "photograph" : "photographs"} • ${displayDate}`}
      />
      {sortedPhotos.length > 0 ? (
        <>
          <SeriesCarousel
            seriesTitle={series.title}
            seriesDescription={series.description}
            photos={sortedPhotos}
            createdAt={displayDate}
          />
          <div className="mt-16 border-t border-line/70 pt-12">
            <h2 className="font-serif text-2xl tracking-tight text-ink sm:text-3xl">
              Frames in this Series
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted">
              Individual photographs captured in this sequence.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3">
              {sortedPhotos.map((photo, idx) => {
                const frameNum = String(idx + 1).padStart(2, "0");
                return (
                  <CoverCard
                    key={photo.id}
                    item={{
                      id: photo.id,
                      title: photo.title || `Frame ${frameNum}`,
                      description: photo.description,
                      cloudinary_url: photo.cloudinary_url,
                    }}
                    href={`/photo/${photo.id}`}
                    size="compact"
                    meta={frameNum}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <EmptyState description="No photographs added to this series yet." />
      )}
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
