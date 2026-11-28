/** Builds a descriptive alt attribute for a photograph, frame, or cover image. */
export function getPhotoAlt(
  item: { title?: string | null; description?: string | null },
  fallback = "A Momented photograph",
): string {
  if (item.description && item.title && item.description !== item.title) {
    return `${item.title} — ${item.description}`;
  }
  return item.title || item.description || fallback;
}
