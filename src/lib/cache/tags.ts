import "server-only";
import { updateTag } from "next/cache";
export const CACHE_TAGS = {
  photos: "photos",
  photosIds: "photos-ids",
  collections: "collections",
  collectionsIds: "collections-ids",
  rules: "rules",
  ruleCollections: "rule_collections",
  ruleCollectionsIds: "rule_collections-ids",
  calendar: "calendar",
  calendarCollections: "calendar_collections",
  calendarCollectionsIds: "calendar_collections-ids",
  series: "series",
  seriesIds: "series-ids",
} as const;
export function revalidatePhotos(id?: string | number) {
  updateTag(CACHE_TAGS.photos);
  updateTag(CACHE_TAGS.photosIds);
  updateTag(CACHE_TAGS.collections);
  updateTag(CACHE_TAGS.rules);
  updateTag(CACHE_TAGS.calendar);
  updateTag(CACHE_TAGS.series);
  if (id) updateTag(`photo-${id}`);
}
export function revalidateCollections(id?: string) {
  updateTag(CACHE_TAGS.collections);
  updateTag(CACHE_TAGS.rules);
  updateTag(CACHE_TAGS.collectionsIds);
  updateTag(CACHE_TAGS.ruleCollectionsIds);
  updateTag(CACHE_TAGS.photos);
  if (id) updateTag(`collection-${id}`);
}
export function revalidateRules(id?: string) {
  updateTag(CACHE_TAGS.collections);
  updateTag(CACHE_TAGS.rules);
  updateTag(CACHE_TAGS.ruleCollections);
  updateTag(CACHE_TAGS.collectionsIds);
  updateTag(CACHE_TAGS.ruleCollectionsIds);
  updateTag(CACHE_TAGS.photos);
  if (id) updateTag(`rule-${id}`);
}
export function revalidateCalendar(id?: string | number) {
  updateTag(CACHE_TAGS.collections);
  updateTag(CACHE_TAGS.calendar);
  updateTag(CACHE_TAGS.calendarCollections);
  updateTag(CACHE_TAGS.calendarCollectionsIds);
  updateTag(CACHE_TAGS.photos);
  if (id) updateTag(`calendar-${id}`);
}
export function revalidateSeries(id?: string) {
  updateTag(CACHE_TAGS.series);
  updateTag(CACHE_TAGS.seriesIds);
  updateTag(CACHE_TAGS.photos);
  if (id) updateTag(`series-${id}`);
}
