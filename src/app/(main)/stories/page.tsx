import type { Metadata } from "next";
import CoverCard from "@/components/ui/CoverCard";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import type { Story } from "@/types";
export const metadata: Metadata = { title: "Stories" };
export default async function StoriesPage() {
  const { data: stories, error } = await supabase
    .from("stories")
    .select("*, photos!photo_stories(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  if (error)
    return <div className="p-10 text-center">Failed to load stories.</div>;
  const typedStories = (stories as Story[]) || [];
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
        <div className="text-center py-24 px-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 dark:text-zinc-400">
          <p className="text-zinc-500 col-span-full">No stories written yet.</p>
        </div>
      )}
    </main>
  );
}
