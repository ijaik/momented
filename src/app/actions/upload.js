"use server";
import { revalidatePath } from "next/cache";
import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";
export async function getCloudinarySignatureAction() {
  await verifyAdminSession();
  const timestamp = Math.round(Date.now() / 1000);
  const folder =
    process.env.NODE_ENV === "development"
      ? siteConfig.cloudinary.folderDev
      : siteConfig.cloudinary.folderProd;
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
    cloudName: siteConfig.cloudinary.cloudName,
  };
}
export async function savePhotoToDbAction(data) {
  await verifyAdminSession();
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
      artist: data.artistInput || exifArtist || siteConfig.author.name,
      taken_at: meta.DateTimeOriginal || null,
    },
  ]);
  if (dbError) throw new Error(`Database Error: ${dbError.message}`);
  revalidatePath("/", "layout");
  return { success: true };
}
