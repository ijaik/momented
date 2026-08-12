"use server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/request";
import { getAdminDb } from "@/lib/supabase-admin";

const STAT_WINDOW_MS = 60 * 60 * 1000;
const STAT_MAX_REQUESTS = 120;
async function isStatRateLimited(action: string): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimit(
    `stats:${action}:${ip}`,
    STAT_MAX_REQUESTS,
    STAT_WINDOW_MS,
  ).limited;
}
export async function incrementDownload(photoId: string): Promise<number> {
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
export async function incrementShare(photoId: string | number): Promise<void> {
  if (await isStatRateLimited("share"))
    throw new Error("Rate limit exceeded. Try again later.");
  const db = getAdminDb();
  const { error } = await db.rpc("increment_shares", {
    row_id: String(photoId),
  });
  if (error) {
    console.error("Increment shares error:", error);
    throw new Error("Could not update share count");
  }
}
