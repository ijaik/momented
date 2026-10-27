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
  created_at?: string;
  downloads?: number;
  shares?: number;
  collections?: EntityReference[];
  rules?: EntityReference[];
  calendars?: CalendarReference[];
  series?: EntityReference[];
}
export interface EntityReference {
  id: string;
  title: string;
}
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
export interface SeriesSlidePhoto extends Photo {
  position: number;
}
export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};
