import PhotoGrid from "@/components/photos/PhotoGrid";
import DetailLayout from "@/components/ui/DetailLayout";
import EmptyState from "@/components/ui/EmptyState";
import {
  getAllIds,
  getCollectionById,
  getPhotosForCollection,
} from "@/lib/db/queries";
import type { PageProps } from "@/types";
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("collections");
  return ids.map((id) => ({ id }));
}
export default async function SingleCollectionPage({
  params,
}: PageProps<{ id: string }>) {
  const { id } = await params;
  const [{ data: collection }, { data: photos }] = await Promise.all([
    getCollectionById(id),
    getPhotosForCollection(id),
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
