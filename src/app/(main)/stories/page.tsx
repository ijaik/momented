import type { Metadata } from "next";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
export const metadata: Metadata = { title: "Stories" };
export const revalidate = 3600;
export default async function StoriesPage() {
  const { data: stories, error } = await supabase
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  if (error) return <EmptyState description="Failed to load stories." />;
  const typedStories = stories || [];
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <PageHeader
        title="Stories"
        subtitle={
          <>
            Thoughts behind the{" "}
            <span className="font-leckerli tracking-tight">Momented</span>.
          </>
        }
        description="Where the captured moment meets your own narrative."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {typedStories.map((story, index) => (
          <CoverCard
            key={story.id}
            item={story}
            href={`/stories/${story.id}`}
            index={index}
          />
        ))}
      </div>
      {typedStories.length === 0 && (
        <div className="col-span-full pt-8">
          <EmptyState description="No stories written yet." />
        </div>
      )}
    </main>
  );
}
