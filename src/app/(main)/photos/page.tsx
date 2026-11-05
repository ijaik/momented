import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { getHomePhotos } from "@/lib/db/queries";
import { breadcrumbJsonLd, homePageGalleryJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Photographs",
  description:
    "Browse the full archive of minimalist photographs on Momented — quiet studies of light, shadow, and moments in between. Free high-resolution download.",
  path: "/photos",
});
export default async function PhotosPage() {
  const { data: photos, error } = await getHomePhotos();
  if (error)
    return (
      <EmptyState description="The photographs failed to load. Please try again in a moment." />
    );
  const photoList = photos || [];
  const count = photoList.length;
  return (
    <>
      <JsonLd
        data={[
          homePageGalleryJsonLd(photoList),
          breadcrumbJsonLd([
            { name: "Photographs", url: `${siteConfig.url}/photos` },
          ]),
        ]}
      />
      <PageHeader
        badge="01 / Full Archive"
        title="Photographs"
        description="A journal of light, shadow, and the moments in between — one frame at a time."
        meta={
          count > 0
            ? `${count} ${count === 1 ? "moment" : "moments"} in the vault`
            : undefined
        }
      />
      <PhotoGrid photos={photoList} />
    </>
  );
}
