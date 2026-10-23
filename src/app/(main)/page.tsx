import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getHomePhotos } from "@/lib/db/queries";
import { websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
export const metadata: Metadata = buildPageMetadata({
  title: "Momented — Minimalist Photography Journal & Gallery",
  description:
    "Explore the latest captured moments on Momented — a minimalist photography journal of light, shadow, and moments in between by Jai.",
  path: "/",
});
export default async function Home() {
  const { data: photos, error } = await getHomePhotos();
  if (error)
    return (
      <EmptyState description="The photographs failed to load. Please try again in a moment." />
    );
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <JsonLd data={websiteJsonLd()} />
      <PageHeader
        title="Photographs"
        description="A journal of light, shadow, and the moments in between — one frame at a time."
        meta={`${photos?.length ?? 0} ${(photos?.length ?? 0) === 1 ? "moment" : "moments"} so far`}
      />
      <PhotoGrid photos={photos || []} />
    </main>
  );
}
