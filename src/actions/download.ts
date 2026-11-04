"use server";
import { updateTag } from "next/cache";
import { siteConfig } from "@/config/site";
import { checkRateLimit } from "@/lib/auth/rateLimit";
import { getClientIp } from "@/lib/auth/request";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { getAdminDb } from "@/lib/db/supabase-admin";
import {
  assertValidUUID,
  CLOUDINARY_PUBLIC_ID_PATTERN,
  CLOUDINARY_URL_PATTERN,
} from "@/lib/utils/validation";

async function isStatRateLimited(action: string): Promise<boolean> {
  const ip = await getClientIp();
  return (await checkRateLimit(`stats:${action}:${ip}`)).limited;
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
  assertValidUUID(idStr, "photo ID");
  const cloudName = siteConfig.cloudinary.cloudName;
  if (
    !cloudinaryUrl ||
    !CLOUDINARY_URL_PATTERN.test(cloudinaryUrl) ||
    !cloudinaryUrl.startsWith(`https://res.cloudinary.com/${cloudName}/`)
  )
    throw new Error("Invalid Cloudinary URL");
  let updatedCount: number | undefined;
  try {
    updatedCount = await incrementDownload(idStr);
    updateTag(`photo-${idStr}`);
  } catch (err) {
    console.warn("Could not increment download count:", err);
  }
  try {
    const db = getAdminDb();
    const { data: photo } = await db
      .from("photos")
      .select("cloudinary_public_id")
      .eq("id", idStr)
      .maybeSingle();
    const publicId = photo?.cloudinary_public_id;
    if (publicId && CLOUDINARY_PUBLIC_ID_PATTERN.test(publicId)) {
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
  assertValidUUID(photoId, "photo ID");
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
  return Number(data);
}
export async function incrementShare(
  photoId: string | number,
): Promise<number | null> {
  const idStr = String(photoId);
  assertValidUUID(idStr, "photo ID");
  if (await isStatRateLimited("share")) {
    console.warn("Share stat rate limited for photo:", idStr);
    return null;
  }
  try {
    const db = getAdminDb();
    const { data, error } = await db.rpc("increment_shares", {
      row_id: idStr,
    });
    if (error) {
      console.warn("Increment shares database error:", error.message || error);
      return null;
    }
    updateTag(`photo-${idStr}`);
    return Number(data);
  } catch (err) {
    console.warn("Failed to increment share count:", err);
    return null;
  }
}
