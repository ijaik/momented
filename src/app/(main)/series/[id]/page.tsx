import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import SeriesCarousel from "@/components/series/SeriesCarousel";
import BackButton from "@/components/ui/BackButton";
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
  if (id === "_") {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <BackButton label="All series" className="mb-8" />
        <EmptyState description="No series curated yet." />
      </main>
    );
  }
  const { data: series } = await getSeriesById(id);
  if (!series) {
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <BackButton label="All series" className="mb-8" />
        <EmptyState description="Series not found." />
      </main>
    );
  }
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
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      <JsonLd
        data={[
          seriesPageJsonLd(series, url, sortedPhotos),
          breadcrumbJsonLd([
            { name: "Series", url: `${siteConfig.url}/series` },
            { name: series.title, url },
          ]),
        ]}
      />
      <BackButton label="All series" className="mb-8 md:mb-10" />
      <header className="mb-8 max-w-3xl border-b border-line pb-8 sm:mb-10">
        <h1 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-5xl">
          {series.title}
        </h1>
        {series.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
            {series.description}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          Curated on {displayDate} · by {siteConfig.author.name}
        </p>
      </header>
      {sortedPhotos.length > 0 ? (
        <SeriesCarousel
          seriesTitle={series.title}
          seriesDescription={series.description}
          photos={sortedPhotos}
        />
      ) : (
        <EmptyState description="No photographs added to this series yet." />
      )}
    </main>
  );
}
