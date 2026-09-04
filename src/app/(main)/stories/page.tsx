import type { Metadata } from "next";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getStoriesWithPhotos } from "@/lib/db/queries";
export const metadata: Metadata = {
  title: "Stories",
  description: "Read the stories behind each captured moment on Momented.",
  alternates: { canonical: "/stories" },
};
export const revalidate = 3600;
export default async function StoriesPage() {
  const { data: stories, error } = await getStoriesWithPhotos();
  if (error)
    return (
      <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <EmptyState description="The stories failed to load. Please try again in a moment." />
      </main>
    );
  const typedStories = stories || [];
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        title="Stories"
        description="The thinking around a frame — notes and narratives that grew out of the moments."
      />
      {typedStories.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {typedStories.map((story, index) => (
            <CoverCard
              key={story.id}
              item={story}
              href={`/stories/${story.id}`}
              index={index}
              meta={
                story.created_at
                  ? new Date(story.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No stories have been written yet." />
      )}
    </main>
  );
}
