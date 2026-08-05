"use server";
import { getAdminDb } from "@/lib/supabase-admin";
export async function incrementDownload(photoId) {
  const db = await getAdminDb(false);
  const { data, error } = await db.rpc("increment_downloads", {
    row_id: photoId,
  });
  if (error) {
    console.error("Increment downloads error:", error);
    throw new Error("Could not update download count");
  }
  return data;
}
