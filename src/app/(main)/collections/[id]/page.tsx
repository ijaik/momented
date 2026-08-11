import PhotoGrid from "@/components/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import { supabase } from "@/lib/supabase";
import type { PageProps, Photo } from "@/types";
export default async function SingleCollectionPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: collection }, { data: photos }] = await Promise.all([
    supabase
      .from("collections")
      .select("title, description")
      .eq("id", id)
      .single(),
    supabase
      .from("photos")
      .select(
        "id, title, description, created_at, cloudinary_url, width, height, camera_model, photo_collections!inner(collection_id)",
      )
      .eq("photo_collections.collection_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!collection)
    return (
      <div className="p-20 text-center text-xl">Collection not found.</div>
    );
  return (
    <DetailLayout title={collection.title} description={collection.description}>
      <PhotoGrid
        photos={(photos as unknown as Photo[]) || []}
        emptyMessage="No photos have been added to this collection yet."
      />
    </DetailLayout>
  );
}
