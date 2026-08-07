"use server";
import { revalidatePath } from "next/cache";
import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getAdminDb } from "@/lib/supabase-admin";

function parseExifDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const formattedStr = dateStr
    .trim()
    .replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
  const parsed = new Date(formattedStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
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
  const takenAtDate = parseExifDate(meta.DateTimeOriginal);
  const { data: newPhoto, error: dbError } = await db
    .from("photos")
    .insert([
      {
        title: data.title,
        description: data.description,
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
        taken_at: takenAtDate,
      },
    ])
    .select()
    .single();
  if (dbError) throw new Error(`Database Error: ${dbError.message}`);
  const photoDate = takenAtDate ? new Date(takenAtDate) : new Date();
  const monthId = photoDate.getMonth() + 1;
  await db.from("photo_calendar_collections").insert([
    {
      photo_id: newPhoto.id,
      calendar_id: monthId,
    },
  ]);
  if (data.collectionIds?.length) {
    await db.from("photo_collections").insert(
      data.collectionIds.map((cId) => ({
        photo_id: newPhoto.id,
        collection_id: cId,
      })),
    );
  }
  if (data.ruleIds?.length) {
    await db.from("photo_rule_collections").insert(
      data.ruleIds.map((rId) => ({
        photo_id: newPhoto.id,
        rule_id: rId,
      })),
    );
  }
  if (data.storyIds?.length) {
    await db.from("photo_stories").insert(
      data.storyIds.map((sId) => ({
        photo_id: newPhoto.id,
        story_id: sId,
      })),
    );
  }
  revalidatePath("/", "layout");
  return { success: true };
}
