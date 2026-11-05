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
  id: string | number;
  title?: string | null;
  cloudinary_url: string;
}
export interface QueuedSlideFile {
  file: File;
  preview: string;
  title: string;
  description: string;
}
