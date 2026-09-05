import type { Metadata } from "next";
import { cache } from "react";
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

type GroupedPhotos = Record<number, Record<string, Photo[]>>;
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("calendar_collections");
  return ids.map((id) => ({ id }));
}
const getCalendarMonth = cache(async (monthIndex: number) => {
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCalendarMonthById(monthIndex),
    getPhotosForCalendarMonth(monthIndex),
  ]);
  return { collection, photos: photos ?? [] };
});
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return { title: "Month Not Found" };
  const { collection, photos } = await getCalendarMonth(monthIndex);
  if (!collection) return { title: "Month Not Found" };
  return buildPageMetadata({
    title: collection.title,
    description: collection.description || undefined,
    path: `/collections/calendar/${id}`,
    imageUrl: photos[0]?.cloudinary_url,
  });
}
export default async function CalendarMonthPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const monthIndex = parseInt(id, 10);
  if (Number.isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12)
    return <EmptyState description="Invalid month requested." />;
  const { collection, photos: monthPhotos } =
    await getCalendarMonth(monthIndex);
  if (!collection) return <EmptyState description="Month not found." />;
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
      const photosForYear: Photo[] = [];
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
