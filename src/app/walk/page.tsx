import type { Metadata } from "next";
import { STATIC_FALLBACK_PHOTOS } from "@/lib/constants/fallbackPhotos";
import { getAllPhotos } from "@/lib/db/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Photo } from "@/types";
import GalleryWalk from "./GalleryWalk";
export const metadata: Metadata = buildPageMetadata({
  title: "Walk — 3D Gallery Passage Experience",
  description:
    "A first-person 3D curved gallery passage. Walk through light, shadows, and fine-art photography in an immersive WebGL gallery.",
  path: "/walk",
});
export default async function WalkPage() {
  let photos: Photo[] = [];
  try {
    const { data } = await getAllPhotos();
    photos = data;
  } catch (err) {
    console.warn("Failed to fetch gallery walk photos from database:", err);
  }
  if (photos.length === 0) photos = STATIC_FALLBACK_PHOTOS;
  return <GalleryWalk photos={photos} />;
}
