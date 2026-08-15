"use server";
import { revalidatePath } from "next/cache";
import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
import { parsePhotoDate } from "@/lib/utils/dateUtils";
export interface CloudinarySignatureResponse {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
}
export interface SavePhotoPayload {
  title: string;
  description?: string;
  artistInput?: string;
  collectionIds?: string[];
  ruleIds?: string[];
  storyIds?: string[];
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  image_metadata?: {
    Make?: string;
    Model?: string;
    FocalLength?: string | number;
    ISOSpeedRatings?: string | number;
    ISO?: string | number;
    Artist?: string;
    Copyright?: string;
    Creator?: string;
    Byline?: string;
    DateTimeOriginal?: string;
    DateTimeDigitized?: string;
    DateTime?: string;
    CreateDate?: string;
    DateCreated?: string;
    FNumber?: number | string;
    ExposureTime?: number | string;
    [key: string]: unknown;
  };
}
export async function getCloudinarySignatureAction(): Promise<CloudinarySignatureResponse> {
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
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret)
    throw new Error("Missing CLOUDINARY_API_SECRET environment variable");
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudName: siteConfig.cloudinary.cloudName || "",
  };
}
const CLOUDINARY_URL_PATTERN = /^https:\/\/res\.cloudinary\.com\/[^\s]+$/;
const CLOUDINARY_PUBLIC_ID_PATTERN = /^[A-Za-z0-9_/-]{1,200}$/;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5_000;
const MAX_ARTIST_LENGTH = 200;
function assertSafeAsset(data: SavePhotoPayload): void {
  if (
    typeof data.secure_url !== "string" ||
    !CLOUDINARY_URL_PATTERN.test(data.secure_url)
  )
    throw new Error("Invalid image URL.");
  if (
    typeof data.public_id !== "string" ||
    !CLOUDINARY_PUBLIC_ID_PATTERN.test(data.public_id)
  )
    throw new Error("Invalid image identifier.");
  if (!data.title?.trim() || data.title.length > MAX_TITLE_LENGTH)
    throw new Error("A valid title is required.");
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH)
    throw new Error("Description is too long.");
  if (data.artistInput && data.artistInput.length > MAX_ARTIST_LENGTH)
    throw new Error("Artist name is too long.");
  if (
    !Number.isInteger(data.width) ||
    !Number.isInteger(data.height) ||
    data.width <= 0 ||
    data.height <= 0
  )
    throw new Error("Invalid image dimensions.");
}
export async function savePhotoToDbAction(
  data: SavePhotoPayload,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertSafeAsset(data);
  const db = getAdminDb();
  const meta = data.image_metadata || {};
  const rawFocal = meta.FocalLength || "";
  const cleanFocal = rawFocal
    ? `${rawFocal.toString().replace(/[^0-9.]/g, "")}mm`
    : null;
  const rawIso = meta.ISOSpeedRatings || meta.ISO;
  const cleanIso = rawIso ? parseInt(rawIso.toString(), 10) : null;
  const exifArtist =
    meta.Artist || meta.Copyright || meta.Creator || meta.Byline || null;
  const rawExifDate = (meta.DateTimeOriginal ||
    meta.DateTimeDigitized ||
    meta.DateTime ||
    meta.CreateDate ||
    meta.DateCreated) as string | undefined;
  const takenAtDate = parsePhotoDate(rawExifDate)?.toISOString() ?? null;
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
  await syncJunction(
    db,
    "photo_collections",
    "photo_id",
    newPhoto.id,
    "collection_id",
    data.collectionIds ?? [],
  );
  await syncJunction(
    db,
    "photo_rule_collections",
    "photo_id",
    newPhoto.id,
    "rule_id",
    data.ruleIds ?? [],
  );
  await syncJunction(
    db,
    "photo_stories",
    "photo_id",
    newPhoto.id,
    "story_id",
    data.storyIds ?? [],
  );
  revalidatePath("/", "layout");
  return { success: true };
}
