export interface PhotoDateInfo {
  year: number;
  month: number;
  day: number;
  dateString: string;
}
export function parsePhotoDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const formattedStr = dateStr
    .trim()
    .replace(/^(\d{4}):(\d{2}):(\d{2})[\sT]?/, "$1-$2-$3T");
  const parsed = new Date(formattedStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
export function getPhotoDate(photo: {
  taken_at?: string | null;
  created_at?: string | null;
}): PhotoDateInfo {
  const dateObj =
    parsePhotoDate(photo.taken_at) ||
    parsePhotoDate(photo.created_at) ||
    new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, dateString };
}
export function formatDisplayDate(
  createdAt?: string | null,
  takenAt?: string | null,
): string {
  const dateObj = parsePhotoDate(takenAt) || parsePhotoDate(createdAt);
  if (!dateObj) {
    return "Unknown date";
  }
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
