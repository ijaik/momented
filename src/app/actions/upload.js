"use server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/supabase-admin";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function getCloudinarySignatureAction() {
  await getAdminDb();
  const timestamp = Math.round(Date.now() / 1000);
  const folder =
    process.env.NODE_ENV === "development" ? "momented-dev" : "momented-prod";
  const paramsToSign = {
    timestamp,
    folder,
    image_metadata: true,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );
  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
}
export async function savePhotoToDbAction(data) {
  const db = await getAdminDb();
  const meta = data.image_metadata || {};
  const rawFocal = meta.FocalLength || "";
  const cleanFocal = rawFocal
    ? `${rawFocal.toString().replace(/[^0-9.]/g, "")}mm`
    : null;
  const rawIso = meta.ISOSpeedRatings || meta.ISO;
  const cleanIso = rawIso ? parseInt(rawIso, 10) : null;
  const exifArtist =
    meta.Artist || meta.Copyright || meta.Creator || meta.Byline || null;
  const { error: dbError } = await db.from("photos").insert([
    {
      title: data.title,
      description: data.description,
      collection_id: data.collectionId || null,
      story_id: data.storyId || null,
      cloudinary_url: data.secure_url,
      cloudinary_public_id: data.public_id,
      width: data.width,
      height: data.height,
      camera_make: meta.Make || null,
      camera_model: meta.Model || null,
      focal_length: cleanFocal,
      aperture: meta.FNumber ? `f/${meta.FNumber}` : null,
      shutter_speed: meta.ExposureTime ? `${meta.ExposureTime}s` : null,
      iso: cleanIso,
      artist: data.artistInput || exifArtist || null,
      taken_at: meta.DateTimeOriginal || null,
    },
  ]);
  if (dbError) throw new Error(`Database Error: ${dbError.message}`);
  revalidatePath("/", "layout");
  return { success: true };
}
