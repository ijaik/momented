"use server";
import { updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/auth";
import { getAdminDb } from "@/lib/db/supabase-admin";
import {
  assertBoundedString,
  assertValidUUID,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/utils/validation";

function revalidateAfterCalendarChange() {
  updateTag("collections");
  updateTag("photos");
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
  assertValidUUID(id, "Calendar ID");
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const coverPhotoRaw = (formData.get("cover_photo_id") as string) || null;
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  const db = getAdminDb();
  const { error } = await db
    .from("calendar_collections")
    .update({ title, description, cover_photo_id: coverPhotoRaw })
    .eq("id", id as never);
  if (error) throw new Error(error.message);
  revalidateAfterCalendarChange();
  return { success: true };
}
