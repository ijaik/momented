export interface Photo {
  id: string;
  title: string | null;
  description?: string | null;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  width: number;
  height: number;
  camera_make?: string | null;
  camera_model?: string | null;
  focal_length?: string | null;
  aperture?: string | null;
  shutter_speed?: string | null;
  iso?: number | null;
  artist?: string | null;
  taken_at?: string | null;
  created_at: string;
  downloads?: number | null;
  shares?: number;
  collections?: CollectionReference[];
  rules?: RuleCollectionReference[];
  stories?: StoryReference[];
  calendars?: CalendarReference[];
  dayContext?: {
    current: number;
    total: number;
  } | null;
}
export interface EntityReference {
  id: string;
  title: string;
}
export type CollectionReference = EntityReference;
export type RuleCollectionReference = EntityReference;
export type StoryReference = EntityReference;
export interface CalendarReference {
  id: number;
  title: string;
}
export interface BaseCollection {
  id: string | number;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  created_at?: string | null;
  photos?: Pick<Photo, "id" | "cloudinary_url">[];
}
export interface Story {
  id: string;
  title: string;
  content: string;
  cover_photo_id?: string | null;
  created_at: string;
  photos?: Pick<Photo, "id" | "cloudinary_url">[];
}
export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};
