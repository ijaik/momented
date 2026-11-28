export interface ChecklistPhoto {
  id: string;
  cloudinary_url: string;
  title?: string;
}
export interface BaseItem<TId extends string | number = string> {
  id: TId;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  photos?: ChecklistPhoto[];
}
export type CalendarItem = BaseItem<number>;
export interface PhotoItem {
  id: string;
  title: string;
  description?: string | null;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  downloads?: number;
  shares?: number;
  collections?: { id: string; title: string }[];
  rules?: { id: string; title: string }[];
}
export interface SeriesItemPhoto {
  id: string;
  title?: string | null;
  cloudinary_url: string;
}
export interface SeriesAdminItem {
  id: string;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  created_at: string;
  photos: SeriesItemPhoto[];
}
export interface PhotoOption {
  id: string;
  title?: string | null;
  cloudinary_url: string;
}
export interface QueuedSlideFile {
  file: File;
  preview: string;
  title: string;
  description: string;
}
