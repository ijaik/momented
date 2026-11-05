"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidateCalendar } from "@/lib/cache/tags";
import { updateCalendarCollectionInDb } from "@/lib/db/mutations";
import { parseEntityFormData } from "@/lib/utils/validation";
export async function editCalendarCollectionAction(
  id: string | number,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  const calendarId =
    typeof id === "number" ? id : Number.parseInt(String(id), 10);
  if (!Number.isInteger(calendarId) || calendarId < 1 || calendarId > 12)
    throw new Error(
      "Invalid Calendar ID: must be an integer between 1 and 12.",
    );
  const { title, description, cover_photo_id, photoIds } =
    parseEntityFormData(formData);
  await updateCalendarCollectionInDb(calendarId, {
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidateCalendar(calendarId);
  return { success: true };
}
