import type { ImageLoaderProps } from "next/image";
import { buildCloudinaryUrl } from "@/lib/cloudinary/cloudinaryUtils";
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.includes("res.cloudinary.com")) return src;
  const qualityParam = quality ? `q_${quality}` : "q_auto";
  return buildCloudinaryUrl(src, [
    "f_auto",
    "c_limit",
    `w_${width}`,
    qualityParam,
  ]);
}
