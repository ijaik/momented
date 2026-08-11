import PhotoGrid from "@/components/PhotoGrid";
import BackButton from "@/components/ui/BackButton";
import { supabase } from "@/lib/supabase";
import type { PageProps, Photo, Story } from "@/types";
export default async function SingleStoryPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: story }, { data: photos }] = await Promise.all([
    supabase
      .from("stories")
      .select("title, created_at, content")
      .eq("id", id)
      .single(),
    supabase
      .from("photos")
      .select(
        "id, title, description, created_at, cloudinary_url, width, height, camera_model, photo_stories!inner(story_id)",
      )
      .eq("photo_stories.story_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (!story)
    return <div className="p-20 text-center text-xl">Story not found.</div>;
  const typedStory = story as Story;
  const typedPhotos = (photos as unknown as Photo[]) || [];
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton />
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6 leading-tight">
            {typedStory.title}
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-6">
            Published {new Date(typedStory.created_at).toLocaleDateString()}
          </p>
        </header>
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
            {typedStory.content}
          </div>
        </article>
      </div>
    </main>
  );
}
