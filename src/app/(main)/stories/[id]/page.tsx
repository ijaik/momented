import type { Metadata } from "next";
import { cache } from "react";
import PhotoGrid from "@/components/photos/PhotoGrid";
import JsonLd from "@/components/seo/JsonLd";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";
import { getAllIds, getPhotosForStory, getStoryById } from "@/lib/db/queries";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("stories");
  return ids.map((id) => ({ id }));
}
const getStory = cache(async (id: string) => {
  const [{ data: story }, { data: photos }] = await Promise.all([
    getStoryById(id),
    getPhotosForStory(id),
  ]);
  return { story, photos: photos ?? [] };
});
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const { story, photos } = await getStory(id);
  if (!story) return { title: "Story Not Found" };
  return buildPageMetadata({
    title: story.title,
    description: story.content.replace(/\s+/g, " ").trim().slice(0, 155),
    path: `/stories/${id}`,
    imageUrl: photos[0]?.cloudinary_url,
    type: "article",
    publishedTime: story.created_at,
  });
}
export default async function SingleStoryPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const { story, photos } = await getStory(id);
  if (!story) return <EmptyState description="Story not found." />;
  const typedPhotos = photos;
  const url = `${siteConfig.url}/stories/${id}`;
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
          <header className="mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6 leading-tight">
              {story.title}
            </h1>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-6">
              Published {new Date(story.created_at).toLocaleDateString()}
            </p>
          </header>
        }
      >
        {typedPhotos.length > 0 && (
          <section className="mb-20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8">
              The Visuals
            </h3>
            <PhotoGrid photos={typedPhotos} />
          </section>
        )}
        <article className="max-w-3xl">
          <div className="text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {story.content}
          </div>
        </article>
      </DetailLayout>
    </>
  );
}
