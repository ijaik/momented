import PhotoGrid from "@/components/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { data } = await supabase.from("collections").select("id");
  return (data ?? []).map((collection) => ({ id: collection.id }));
}
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
  if (!collection) return <EmptyState description="Collection not found." />;
  return (
    <DetailLayout title={collection.title} description={collection.description}>
      <PhotoGrid
        photos={photos || []}
        emptyMessage="No photos have been added to this collection yet."
      />
    </DetailLayout>
  );
}
