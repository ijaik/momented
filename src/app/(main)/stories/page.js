import CoverCard from "@/components/ui/CoverCard";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
export const metadata = { title: "Stories" };
export default async function StoriesPage() {
  const { data: stories, error } = await supabase
    .from("stories")
    .select(
      "id, title, cover_photo_id, created_at, photos!story_id(id, cloudinary_url)",
    )
    .order("created_at", { ascending: false });
  if (error)
    return <div className="p-10 text-center">Failed to load stories.</div>;
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
        {stories?.map((story, index) => (
          <CoverCard
            key={story.id}
            item={story}
            href={`/stories/${story.id}`}
            index={index}
          />
        ))}
        {stories?.length === 0 && (
          <p className="text-zinc-500 col-span-full">No stories written yet.</p>
        )}
      </div>
    </main>
  );
}
