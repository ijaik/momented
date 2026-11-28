export function sortSeriesPhotos<T extends { position: number }>(
  rows: T[],
): T[] {
  return rows.toSorted((a, b) => a.position - b.position);
}
export function extractSortedSeriesPhotos<TPhoto>(
  rows: { position: number; photos: TPhoto | null }[] | null | undefined,
): TPhoto[] {
  if (!rows || rows.length === 0) return [];
  return sortSeriesPhotos(rows)
    .map((sp) => sp.photos)
    .filter((p): p is TPhoto => Boolean(p));
}
