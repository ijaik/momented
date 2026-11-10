import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import { sortSeriesPhotos } from "@/lib/utils/series";
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
  const title = series.title || "Series";
  const description =
    series.description ||
    `Explore "${title}" — a series on ${siteConfig.name}.`;
  const rawPhotos =
    (series.series_photos as unknown as {
      position: number;
      photos: Photo;
    }[]) || [];
  const firstPhoto = sortSeriesPhotos(rawPhotos)[0]?.photos;
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
  const sortedPhotos: SeriesSlidePhoto[] = sortSeriesPhotos(rawPhotos)
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
        badge="Series"
        backLink={{ href: "/series", label: "All Series" }}
        title={series.title}
        description={series.description}
        meta={`${sortedPhotos.length} ${sortedPhotos.length === 1 ? "photograph" : "photographs"} • ${displayDate}`}
      >
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
              <p className="mt-1 text-sm text-muted">
                Individual photographs captured in this sequence.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {sortedPhotos.map((photo, idx) => (
                  <Link
                    key={photo.id}
                    href={`/photo/${photo.id}`}
                    aria-label={`View photograph: ${photo.title || `Frame ${idx + 1}`}`}
                    className="group block overflow-hidden rounded-xl border border-line/60 bg-soft shadow-2xs transition-all hover:border-line hover:shadow-sm"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={photo.cloudinary_url}
                        alt={
                          photo.title || `${series.title} — Frame ${idx + 1}`
                        }
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-medium text-ink">
                        {photo.title ||
                          `Frame ${String(idx + 1).padStart(2, "0")}`}
                      </p>
                      <p className="text-[10px] font-mono text-muted">
                        0{idx + 1}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
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
