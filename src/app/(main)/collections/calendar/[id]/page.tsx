import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import {
  getAllIds,
  getCalendarMonthById,
  getPhotosForCalendarMonth,
} from "@/lib/db/queries";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPhotoDate } from "@/lib/utils/dateUtils";
import type { PageProps, Photo } from "@/types";
export const instant = false;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("calendar_collections");
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return { title: "Month Not Found" };
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCalendarMonthById(monthIndex),
    getPhotosForCalendarMonth(monthIndex),
  ]);
  if (!collection) return { title: "Month Not Found" };
  return buildPageMetadata({
    title: collection.title,
    description: collection.description || undefined,
    path: `/collections/calendar/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
  });
}
export default async function CalendarMonthPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return <EmptyState description="Invalid month requested." />;
  const [{ data: collection }, { data: rawPhotos }] = await Promise.all([
    getCalendarMonthById(monthIndex),
    getPhotosForCalendarMonth(monthIndex),
  ]);
  const monthPhotos = rawPhotos ?? [];
  if (!collection) return <EmptyState description="Month not found." />;
  const groupedByYear = new Map<number, Map<string, Photo[]>>();
  for (const photo of monthPhotos) {
    const { year, dateString } = getPhotoDate(photo);
    let yearMap = groupedByYear.get(year);
    if (!yearMap) {
      yearMap = new Map();
      groupedByYear.set(year, yearMap);
    }
    const dayPhotos = yearMap.get(dateString);
    if (dayPhotos) {
      dayPhotos.push(photo);
    } else {
      yearMap.set(dateString, [photo]);
    }
  }
  const structuredYears = Array.from(groupedByYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, dayMap]) => {
      const photosForYear: Photo[] = [];
      const sortedDays = Array.from(dayMap.entries()).sort(
        (a, b) => Date.parse(b[0]) - Date.parse(a[0]),
      );
      for (const [, dayPhotos] of sortedDays) {
        const isDense = dayPhotos.length > 2;
        for (let i = 0; i < dayPhotos.length; i++) {
          const photo = dayPhotos[i];
          photosForYear.push(
            isDense
              ? {
                  ...photo,
                  dayContext: { current: i + 1, total: dayPhotos.length },
                }
              : { ...photo, dayContext: null },
          );
        }
      }
      return { year, photos: photosForYear };
    });
  const url = `${siteConfig.url}/collections/calendar/${id}`;
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd(
            collection,
            url,
            monthPhotos[0]?.cloudinary_url,
            monthPhotos,
          ),
          breadcrumbJsonLd([
            {
              name: "Collections",
              url: `${siteConfig.url}/collections`,
            },
            { name: collection.title, url },
          ]),
        ]}
      />
      <DetailLayout
        title={collection.title}
        description={collection.description}
        meta={
          monthPhotos.length === 0
            ? undefined
            : `${monthPhotos.length} ${monthPhotos.length === 1 ? "photograph" : "photographs"}`
        }
      >
        {structuredYears.length > 0 ? (
          <div className="flex flex-col gap-20">
            {structuredYears.map(({ year, photos }) => (
              <section key={year}>
                <h2 className="mb-8 border-b border-line pb-3 text-sm font-medium text-muted">
                  {year} · {photos.length}{" "}
                  {photos.length === 1 ? "photograph" : "photographs"}
                </h2>
                <PhotoGrid photos={photos} />
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            description={`No photographs were captured in ${collection.title.toLowerCase()} yet.`}
            className="pt-6"
          />
        )}
      </DetailLayout>
    </>
  );
}
