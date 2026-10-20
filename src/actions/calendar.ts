"use server";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb, syncJunction } from "@/lib/db/supabase-admin";
import {
  assertBoundedArray,
  assertBoundedString,
  assertValidUUID,
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTO_IDS,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";

function revalidateAfterCalendarChange(id?: string | number) {
  updateTag("collections");
  updateTag("calendar_collections");
  updateTag("calendar_collections-ids");
  updateTag("photos");
  revalidatePath("/collections");
  revalidatePath("/");
  if (id) revalidatePath(`/collections/calendar/${id}`);
}
interface AdminCalendarView {
  id: number;
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  photos: { id: string | number; cloudinary_url: string; title?: string }[];
}
export async function getCalendarCollectionsAction(): Promise<
  AdminCalendarView[]
> {
  await verifyAdminSession();
  const db = getAdminDb();
  const { data, error } = await db
    .from("calendar_collections")
    .select("*, photos!photo_calendar_collections(id, cloudinary_url, title)")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cover_photo_id: row.cover_photo_id,
    photos: (
      (row.photos ?? []) as {
        id: string | number;
        cloudinary_url: string;
        title: string | null;
      }[]
    ).map((p) => ({
      id: p.id,
      cloudinary_url: p.cloudinary_url,
      title: p.title ?? undefined,
    })),
  }));
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
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  const photoIds = formData.getAll("photo_ids").map(String);
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, MAX_PHOTO_IDS, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  const db = getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id: coverPhotoRaw })
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
