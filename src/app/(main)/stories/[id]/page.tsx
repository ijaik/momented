import type { Metadata } from "next";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import { getAllIds, getPhotosForStory, getStoryById } from "@/lib/db/queries";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export const instant = false;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("stories");
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const [{ data: story }, { data: photos }] = await Promise.all([
    getStoryById(id),
    getPhotosForStory(id),
  ]);
  if (!story) return { title: "Story Not Found" };
  return buildPageMetadata({
    title: story.title,
    description: story.content.replace(/\s+/g, " ").trim().slice(0, 155),
    path: `/stories/${id}`,
    imageUrl: photos?.[0]?.cloudinary_url,
    type: "article",
    publishedTime: story.created_at,
  });
}
export default async function SingleStoryPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: story }, { data: rawPhotos }] = await Promise.all([
    getStoryById(id),
    getPhotosForStory(id),
  ]);
  const photos = rawPhotos ?? [];
  if (!story) return <EmptyState description="Story not found." />;
  const url = `${siteConfig.url}/stories/${id}`;
  const published = new Date(story.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(story, photos[0]?.cloudinary_url),
          breadcrumbJsonLd([
            { name: "Stories", url: `${siteConfig.url}/stories` },
            { name: story.title, url },
          ]),
        ]}
      />
      <DetailLayout
        header={
          <header className="mb-14 border-b border-line pb-10">
            <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">
              {story.title}
            </h1>
            <p className="mt-4 text-sm text-muted">Written {published}</p>
          </header>
        }
      >
        <article className="max-w-2xl">
          <div className="whitespace-pre-wrap text-[17px] leading-[1.8] text-ink/90">
            {story.content}
          </div>
        </article>
        {photos.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 border-b border-line pb-3 text-sm font-medium text-muted">
              The photographs behind it
            </h2>
            <PhotoGrid photos={photos} />
          </section>
        )}
      </DetailLayout>
    </>
  );
}
