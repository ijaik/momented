export interface Photo {
  id: string;
  title: string | null;
  description: string | null;
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
  downloads?: number;
  shares?: number;
  collections?: CollectionReference[];
  rules?: RuleCollectionReference[];
  stories?: StoryReference[];
  dayContext?: {
    current: number;
    total: number;
  } | null;
}
export interface CollectionReference {
  id: string;
  title: string;
}
export interface RuleCollectionReference {
  id: string;
  title: string;
}
export interface StoryReference {
  id: string;
  title: string;
}
export interface BaseCollection {
  id: string;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  created_at?: string;
  photos?: Pick<Photo, "id" | "cloudinary_url" | "title">[];
}
export interface Collection extends BaseCollection {}
export interface RuleCollection extends BaseCollection {}
export interface CalendarCollection {
  id: number;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  photos?: Pick<Photo, "id" | "cloudinary_url" | "title">[];
}
export interface Story {
  id: string;
  title: string;
  content: string;
  cover_photo_id?: string | null;
  created_at: string;
  photos?: Pick<Photo, "id" | "cloudinary_url" | "title">[];
}
export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};
