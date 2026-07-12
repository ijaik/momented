import CoverCard from "@/components/ui/CoverCard";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
export const metadata = { title: "Collections" };
export default async function CollectionsPage() {
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, title, cover_photo_id, created_at, photos!collection_id(id, cloudinary_url)")
    .order("created_at", { ascending: false });
  if (error)
    return <div className="p-10 text-center">Failed to load collections.</div>;
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 font-sans">
      <PageHeader
        title="Collections"
        subtitle={
          <>
            Collections of{" "}
            <span className="font-leckerli tracking-tight">Momented</span>.
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections?.map((col, index) => (
          <CoverCard
            key={col.id}
            item={col}
            href={`/collections/${col.id}`}
            index={index}
          />
        ))}
        {collections?.length === 0 && (
          <p className="text-zinc-500 col-span-full">
            No collections created yet.
          </p>
        )}
      </div>
    </main>
  );
}