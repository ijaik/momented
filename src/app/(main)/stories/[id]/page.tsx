import PhotoGrid from "@/components/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { getAllIds, getPhotosForStory, getStoryById } from "@/lib/queries";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("stories");
  return ids.map((id) => ({ id }));
}
export default async function SingleStoryPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: story }, { data: photos }] = await Promise.all([
    getStoryById(id),
    getPhotosForStory(id),
  ]);
  if (!story) return <EmptyState description="Story not found." />;
  const typedPhotos = photos || [];
  return (
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
  );
}
