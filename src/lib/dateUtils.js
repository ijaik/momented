export function getPhotoDate(photo) {
  if (!photo) return { month: 0, year: 0, day: 0, dateString: "" };
  const rawDate = photo.taken_at || photo.created_at;
  if (!rawDate) return { month: 0, year: 0, day: 0, dateString: "" };
  const formatted = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
  const date = new Date(formatted);
  if (Number.isNaN(date.getTime()))
    return { month: 0, year: 0, day: 0, dateString: "" };
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    day: date.getDate(),
    dateString: formatted.split("T")[0].split(" ")[0],
  };
}
export function formatDisplayDate(createdAt, takenAt) {
  const rawDate = takenAt || createdAt;
  if (!rawDate) return "";
  const formatted =
    typeof rawDate === "string" &&
    rawDate.includes(":") &&
    !rawDate.includes("-")
      ? rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
      : rawDate;
  const dateObj = new Date(formatted);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
