"use server";
import { revalidatePath, updateTag } from "next/cache";
import { checkRateLimit } from "@/lib/auth/rateLimit";
import { getClientIp } from "@/lib/auth/request";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb } from "@/lib/db/supabase-admin";
import { assertValidPhotoId } from "@/lib/utils/validation";

const STAT_WINDOW_MS = 60 * 60 * 1000;
const STAT_MAX_REQUESTS = 120;
async function isStatRateLimited(action: string): Promise<boolean> {
  const ip = await getClientIp();
  return (
    await checkRateLimit(
      `stats:${action}:${ip}`,
      STAT_MAX_REQUESTS,
      STAT_WINDOW_MS,
    )
  ).limited;
}
export async function getDownloadUrlAction({
  photoId,
  cloudinaryUrl,
  fileName,
}: {
  photoId: string | number;
  cloudinaryUrl: string;
  fileName?: string;
}): Promise<{ downloadUrl: string; downloadCount?: number }> {
  const idStr = String(photoId);
  let updatedCount: number | undefined;
  try {
    updatedCount = await incrementDownload(idStr);
    updateTag(`photo-${idStr}`);
    revalidatePath(`/photo/${idStr}`);
  } catch (err) {
    console.warn("Could not increment download count:", err);
  }
  try {
    const db = getAdminDb();
    const { data: photo } = await db
      .from("photos")
      .select("cloudinary_public_id")
      .eq("id", idStr)
      .single();
    const publicId = photo?.cloudinary_public_id;
    if (publicId) {
      const cleanBaseName = (fileName || `momented-${idStr}`)
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const signedUrl = cloudinary.url(publicId, {
        sign_url: true,
        flags: cleanBaseName ? `attachment:${cleanBaseName}` : "attachment",
        secure: true,
      });
      return { downloadUrl: signedUrl, downloadCount: updatedCount };
    }
  } catch (err) {
    console.warn("Failed to generate signed Cloudinary download URL:", err);
  }
  return { downloadUrl: cloudinaryUrl, downloadCount: updatedCount };
}
async function incrementDownload(photoId: string): Promise<number> {
  assertValidPhotoId(photoId);
  if (await isStatRateLimited("download"))
    throw new Error("Rate limit exceeded. Try again later.");
  const db = getAdminDb();
  const { data, error } = await db.rpc("increment_downloads", {
    row_id: photoId,
  });
  if (error) {
    console.error("Increment downloads error:", error);
    throw new Error("Could not update download count");
  }
  return data as number;
}
export async function incrementShare(
  photoId: string | number,
): Promise<number> {
  const idStr = String(photoId);
  assertValidPhotoId(idStr);
  if (await isStatRateLimited("share"))
    throw new Error("Rate limit exceeded. Try again later.");
  const db = getAdminDb();
  const { data, error } = await db.rpc("increment_shares", {
    row_id: idStr,
  });
  if (error) {
    console.error("Increment shares error:", error);
    throw new Error("Could not update share count");
  }
  updateTag(`photo-${idStr}`);
  revalidatePath(`/photo/${idStr}`);
  return data as number;
}
