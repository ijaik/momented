"use server";
import { updateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { insertPhotoToDb } from "@/lib/db/mutations";
import { parsePhotoDate } from "@/lib/utils/dateUtils";
import {
  CLOUDINARY_PUBLIC_ID_PATTERN,
  CLOUDINARY_URL_PATTERN,
  MAX_ARTIST_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_DIMENSION,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
  UUID_PATTERN,
} from "@/lib/utils/validation";
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
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!apiKey)
    throw new Error("Missing CLOUDINARY_API_KEY environment variable");
  const cloudName = siteConfig.cloudinary.cloudName;
  if (!cloudName)
    throw new Error("Missing cloudinary.cloudName in site config");
  return {
    timestamp,
    folder,
    signature,
    apiKey,
    cloudName,
  };
}
function assertSafeAsset(data: SavePhotoPayload): void {
  const cloudName = siteConfig.cloudinary.cloudName;
  if (
    typeof data.secure_url !== "string" ||
    !CLOUDINARY_URL_PATTERN.test(data.secure_url) ||
    (cloudName &&
      !data.secure_url.startsWith(`https://res.cloudinary.com/${cloudName}/`))
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
    data.height <= 0 ||
    data.width > MAX_DIMENSION ||
    data.height > MAX_DIMENSION
  )
    throw new Error("Invalid image dimensions.");
  for (const arr of [data.collectionIds, data.ruleIds]) {
    if (arr && arr.length > MAX_PHOTO_IDS)
      throw new Error("Too many junction IDs.");
    for (const id of arr ?? []) {
      if (!UUID_PATTERN.test(id)) throw new Error("Invalid junction ID.");
    }
  }
}
export async function savePhotoToDbAction(
  data: SavePhotoPayload,
): Promise<{ success: boolean; id: string }> {
  await verifyAdminSession();
  assertSafeAsset(data);
  const meta = data.image_metadata || {};
  const rawFocal = meta.FocalLength || "";
  const cleanFocal = rawFocal
    ? `${rawFocal.toString().replace(/[^0-9.]/g, "")}mm`
    : null;
  const rawIso = meta.ISOSpeedRatings || meta.ISO;
  const parsedIso = rawIso ? parseInt(rawIso.toString(), 10) : null;
  const cleanIso = Number.isInteger(parsedIso) ? parsedIso : null;
  const exifArtist =
    meta.Artist || meta.Copyright || meta.Creator || meta.Byline || null;
  const rawExifDate = (meta.DateTimeOriginal ||
    meta.DateTimeDigitized ||
    meta.DateTime ||
    meta.CreateDate ||
    meta.DateCreated) as string | undefined;
  const takenAtDate = parsePhotoDate(rawExifDate)?.toISOString() ?? null;
  const { id, monthId } = await insertPhotoToDb({
    title: data.title,
    description: data.description,
    artist: data.artistInput || exifArtist || siteConfig.author.name,
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
    taken_at: takenAtDate,
    collectionIds: data.collectionIds ?? [],
    ruleIds: data.ruleIds ?? [],
  });
  updateTag("photos");
  updateTag("photos-ids");
  updateTag("collections");
  updateTag("rules");
  updateTag("calendar");
  updateTag(`calendar-${monthId}`);
  for (const cid of data.collectionIds ?? []) updateTag(`collection-${cid}`);
  for (const rid of data.ruleIds ?? []) updateTag(`rule-${rid}`);
  return { success: true, id };
}
