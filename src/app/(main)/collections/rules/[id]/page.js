import PhotoGrid from "@/components/PhotoGrid";
import BackButton from "@/components/ui/BackButton";
import { supabase } from "@/lib/supabase";
export default async function SingleRulePage({ params }) {
  const { id } = await params;
  const [{ data: collection }, { data: photos }] = await Promise.all([
    supabase
      .from("rule_collections")
      .select("title, description")
      .eq("id", id)
      .single(),
    supabase
      .from("photos")
      .select(
        "id, title, cloudinary_url, width, height, camera_model, photo_rule_collections!inner(rule_id)",
      )
      .eq("photo_rule_collections.rule_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!collection) {
    return (
      <div className="p-20 text-center text-xl">Rule collection not found.</div>
    );
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BackButton />
        <header className="mb-16 md:mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-6">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed whitespace-pre-wrap">
              {collection.description}
            </p>
          )}
        </header>
        <PhotoGrid
          photos={photos}
          emptyMessage="No photos have been tagged with this rule yet."
        />
      </div>
    </main>
  );
}
