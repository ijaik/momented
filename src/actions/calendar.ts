"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidateCalendar } from "@/lib/cache/tags";
import { updateCalendarCollectionInDb } from "@/lib/db/mutations";
import { parseEntityFormData } from "@/lib/utils/validation";
export async function editCalendarCollectionAction(
  id: number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  if (!Number.isInteger(id) || id < 1 || id > 12)
    throw new Error(
      "Invalid Calendar ID: must be an integer between 1 and 12.",
    );
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  await updateCalendarCollectionInDb(id, {
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidateCalendar(id);
  return { success: true };
}
