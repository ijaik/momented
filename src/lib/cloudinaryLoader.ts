import type { ImageLoaderProps } from "next/image";
import { buildCloudinaryUrl } from "@/lib/cloudinaryUtils";
export default function cloudinaryLoader({
  src,
  width,
}: ImageLoaderProps): string {
  if (!src.includes("res.cloudinary.com")) return src;
  return buildCloudinaryUrl(src, ["f_auto", "c_limit", `w_${width}`, "q_auto"]);
}
