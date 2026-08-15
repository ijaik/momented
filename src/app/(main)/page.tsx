import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getHomePhotos } from "@/lib/db/queries";
import { websiteJsonLd } from "@/lib/seo/jsonLd";
export const revalidate = 3600;
export const metadata: Metadata = {
  description:
    "Explore the latest captured moments on Momented — a journal of light, shadow, and moments in between by Jai.",
  alternates: { canonical: "/" },
};
export default async function Home() {
  const { data: photos, error } = await getHomePhotos();
  if (error) return <EmptyState description="Failed to load." />;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <JsonLd data={websiteJsonLd()} />
      <PageHeader
        title="Photos"
        subtitle={
          <>
            <span className="font-leckerli tracking-tight">Momented</span> at a
            time.
          </>
        }
      />
      <PhotoGrid photos={photos || []} />
    </main>
  );
}
