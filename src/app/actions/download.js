"use server";
import { getAdminDb } from "@/lib/supabase-admin";
export async function incrementDownload(photoId) {
  const db = await getAdminDb(false);
  const { data, error: fetchError } = await db
    .from("photos")
    .select("downloads")
    .eq("id", photoId)
    .single();
  if (fetchError) throw new Error("Could not fetch photo data");
  const newCount = (data.downloads || 0) + 1;
  const { error: updateError } = await db
    .from("photos")
    .update({ downloads: newCount })
    .eq("id", photoId);
  if (updateError) throw new Error("Could not update download count");
  return newCount;
}
