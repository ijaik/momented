"use server";
import { updateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidatePhotos } from "@/lib/cache/tags";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { insertPhotoToDb } from "@/lib/db/mutations";
import { parsePhotoDate } from "@/lib/utils/dateUtils";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  CLOUDINARY_PUBLIC_ID_PATTERN,
  CLOUDINARY_URL_PATTERN,
  MAX_ARTIST_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_DIMENSION,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
  sanitizeExifFields,
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
function assertSafeAsset(data: SavePhotoPayload): {
  title: string;
  description: string | undefined;
  artistInput: string | undefined;
} {
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
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) throw new Error("A valid title is required.");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  const description = data.description?.trim() || undefined;
  if (description)
    assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  const artistInput = data.artistInput?.trim() || undefined;
  if (artistInput)
    assertBoundedString(artistInput, MAX_ARTIST_LENGTH, "Artist name");
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
    if (!arr) continue;
    assertBoundedArray(arr, MAX_PHOTO_IDS, "Junction IDs");
    for (const id of arr) assertValidUUID(id, "junction ID");
  }
  return { title, description, artistInput };
}
export async function savePhotoToDbAction(
  data: SavePhotoPayload,
): Promise<{ success: boolean; id: string }> {
  await verifyAdminSession();
  const { title, description, artistInput } = assertSafeAsset(data);
  const meta = data.image_metadata || {};
  const { focalLength: cleanFocal, iso: cleanIso } = sanitizeExifFields(meta);
  const exifArtist =
    meta.Artist || meta.Copyright || meta.Creator || meta.Byline || null;
  const rawExifDate = (meta.DateTimeOriginal ||
    meta.DateTimeDigitized ||
    meta.DateTime ||
    meta.CreateDate ||
    meta.DateCreated) as string | undefined;
  const takenAtDate = parsePhotoDate(rawExifDate)?.toISOString() ?? null;
  const { id, monthId } = await insertPhotoToDb({
    title,
    description,
    artist: artistInput || exifArtist || siteConfig.author.name,
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
  revalidatePhotos(id);
  updateTag(`calendar-${monthId}`);
  for (const cid of data.collectionIds ?? []) updateTag(`collection-${cid}`);
  for (const rid of data.ruleIds ?? []) updateTag(`rule-${rid}`);
  return { success: true, id };
}
