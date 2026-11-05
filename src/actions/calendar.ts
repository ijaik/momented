"use server";
import { updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
import { parseEntityFormData } from "@/lib/utils/validation";

function revalidateAfterCalendarChange(id?: string | number) {
  updateTag("collections");
  updateTag("calendar");
  updateTag("calendar_collections");
  updateTag("calendar_collections-ids");
  updateTag("photos");
  if (id) updateTag(`calendar-${id}`);
}
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const calendarId =
    typeof id === "number" ? id : Number.parseInt(String(id), 10);
  if (!Number.isInteger(calendarId) || calendarId < 1 || calendarId > 12) {
    throw new Error(
      "Invalid Calendar ID: must be an integer between 1 and 12.",
    );
  }
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  const db = getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id })
    .eq("id", calendarId as never);
  if (error) throw new Error(error.message);
  await syncJunction(
    db,
    "photo_calendar_collections",
    "calendar_id",
    calendarId,
    "photo_id",
    photoIds,
  );
  revalidateAfterCalendarChange(calendarId);
  return { success: true };
}
