import Link from "next/link";
import PhotoCard from "@/components/PhotoCard";
import { supabase } from "@/lib/supabase";
export default async function SingleStoryPage({ params }) {
  const { id } = await params;
  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("story_id", id)
    .order("created_at", { ascending: true });
  if (!story) {
    return <div className="p-20 text-center text-xl">Story not found.</div>;
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Link
          href="/stories"
          className="inline-flex items-center text-sm font-semibold tracking-wide text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-12 transition-colors uppercase"
        >
          &larr; Back to Stories
        </Link>
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6 leading-tight">
            {story.title}
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-6">
            Published {new Date(story.created_at).toLocaleDateString()}
          </p>
        </header>
        {photos && photos.length > 0 && (
          <section className="mb-20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-8">
              The Visuals
            </h3>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((photo, index) => (
                <PhotoCard key={photo.id} photo={photo} index={index} />
              ))}
            </div>
          </section>
        )}
        <article className="max-w-3xl">
          <div className="text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {story.content}
          </div>
        </article>
      </div>
    </main>
  );
}
