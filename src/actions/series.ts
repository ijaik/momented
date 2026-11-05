"use server";
import { verifyAdminSession } from "@/lib/auth/auth";
import { revalidateSeries } from "@/lib/cache/tags";
import {
  createSeriesInDb,
  deleteSeriesFromDb,
  updateSeriesInDb,
} from "@/lib/db/mutations";
import {
  assertValidUUID,
  MAX_SERIES_PHOTO_IDS,
  parseEntityFormData,
} from "@/lib/utils/validation";
export async function createSeriesAction(
  formData: FormData,
): Promise<{ success: boolean; id?: string }> {
  await verifyAdminSession();
  const { title, description, cover_photo_id, photoIds } = parseEntityFormData(
    formData,
    { maxPhotos: MAX_SERIES_PHOTO_IDS, requireTitle: true },
  );
  const id = await createSeriesInDb({
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidateSeries(id);
  return { success: true, id };
}
export async function editSeriesAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Series ID");
  const { title, description, cover_photo_id, photoIds } = parseEntityFormData(
    formData,
    { maxPhotos: MAX_SERIES_PHOTO_IDS, requireTitle: true },
  );
  await updateSeriesInDb(id, {
    title,
    description,
    cover_photo_id,
    photoIds,
  });
  revalidateSeries(id);
  return { success: true };
}
export async function deleteSeriesAction(
  id: string,
): Promise<{ success: boolean }> {
  await verifyAdminSession();
  assertValidUUID(id, "Series ID");
  await deleteSeriesFromDb(id);
  revalidateSeries(id);
  return { success: true };
}
