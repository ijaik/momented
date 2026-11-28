import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export function buildSignedDownloadUrl(
  publicId: string,
  fileName: string,
): string {
  const cleanBaseName = fileName
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  return cloudinary.url(publicId, {
    sign_url: true,
    flags: cleanBaseName ? `attachment:${cleanBaseName}` : "attachment",
    secure: true,
  });
}
export default cloudinary;
