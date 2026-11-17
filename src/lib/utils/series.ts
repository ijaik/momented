export function sortSeriesPhotos<T extends { position: number }>(
  rows: T[],
): T[] {
  return rows.toSorted((a, b) => a.position - b.position);
}
