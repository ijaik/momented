export function sortSeriesPhotos<T extends { position: number }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => a.position - b.position);
}
