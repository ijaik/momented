import type { Metadata } from "next";
import { Suspense } from "react";
import {
  buildCollectionDetailMetadata,
  CollectionDetailContent,
} from "@/components/collections/CollectionDetailView";
import Skeleton from "@/components/ui/Skeleton";
import { getAllIds } from "@/lib/db/queries";
import type { PageProps } from "@/types";
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllIds("collections");
  if (ids.length === 0) return [{ id: "_" }];
  return ids.map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  return buildCollectionDetailMetadata("collection", id);
}
export default function SingleCollectionPage({
  params,
}: PageProps<{ id: string }>) {
  return (
    <Suspense fallback={<Skeleton variant="collection" />}>
      <CollectionDetailContent kind="collection" params={params} />
    </Suspense>
  );
}
