export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CLOUDINARY_URL_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/[^\s]+$/;
export const CLOUDINARY_PUBLIC_ID_PATTERN = /^[A-Za-z0-9_/-]{1,200}$/;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5_000;
export const MAX_ARTIST_LENGTH = 200;
export const MAX_PHOTO_IDS = 500;
export const MAX_SERIES_PHOTO_IDS = 100;
export const MAX_DIMENSION = 30_000;
export function isValidUUID(id: unknown): boolean {
  if (typeof id === "number") return Number.isInteger(id) && id > 0;
  return typeof id === "string" && UUID_PATTERN.test(id.trim());
}
export function assertValidUUID(id: string | number, label = "ID"): void {
  if (typeof id === "number") {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error(`Invalid ${label}: must be a positive integer.`);
    return;
  }
  if (typeof id !== "string" || !UUID_PATTERN.test(id.trim()))
    throw new Error(`Invalid ${label}.`);
}
export function assertBoundedString(
  value: string,
  maxLength: number,
  label: string,
): void {
  if (typeof value !== "string" || value.length > maxLength)
    throw new Error(`${label} exceeds maximum length of ${maxLength}.`);
}
export function assertBoundedArray(
  arr: unknown[],
  maxLength: number,
  label: string,
): void {
  if (!Array.isArray(arr) || arr.length > maxLength)
    throw new Error(`${label} exceeds maximum of ${maxLength} items.`);
}
export interface ParsedEntityFormData {
  title: string;
  description: string;
  cover_photo_id: string | null;
  photoIds: string[];
}
export function parseEntityFormData(
  formData: FormData,
  {
    maxPhotos = MAX_PHOTO_IDS,
    requireTitle = false,
  }: { maxPhotos?: number; requireTitle?: boolean } = {},
): ParsedEntityFormData {
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const coverPhotoRaw =
    ((formData.get("cover_photo_id") as string) || "").trim() || null;
  const photoIds = Array.from(
    new Set(formData.getAll("photo_ids").map(String).filter(Boolean)),
  );
  if (requireTitle && !title) throw new Error("Title is required.");
  assertBoundedString(title, MAX_TITLE_LENGTH, "Title");
  assertBoundedString(description, MAX_DESCRIPTION_LENGTH, "Description");
  if (coverPhotoRaw) assertValidUUID(coverPhotoRaw, "Cover photo ID");
  assertBoundedArray(photoIds, maxPhotos, "Photo IDs");
  for (const pid of photoIds) assertValidUUID(pid, "Photo ID");
  return {
    title,
    description,
    cover_photo_id: coverPhotoRaw,
    photoIds,
  };
}
