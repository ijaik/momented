import type { ApiPhoto } from "@/lib/db/queries";
export interface StaticFallbackPhoto extends ApiPhoto {
  fallback_filename: string;
}
export const STATIC_FALLBACK_PHOTOS: StaticFallbackPhoto[] = [
  {
    id: "fd546800-db9f-4fd7-877d-28cad35f25ce",
    title: "The Other Looks Back",
    description: "Turns out, the feeling was mutual.",
    cloudinary_url:
      "https://res.cloudinary.com/momented/image/upload/v1793451120/momented-prod/escjcepqcpkcmntuqk6s.jpg",
    cloudinary_public_id: "momented-prod/escjcepqcpkcmntuqk6s",
    width: 5000,
    height: 3749,
    camera_make: "motorola",
    camera_model: "moto g64 5G",
    focal_length: "4.3mm",
    aperture: "f/1.8",
    shutter_speed: "1/50s",
    iso: 461,
    artist: "Jai",
    taken_at: "2026-08-05T19:20:47+00:00",
    created_at: "2026-08-05T19:20:47+00:00",
    fallback_filename: "fallback-landscape.jpg",
  },
  {
    id: "2913ecca-ed38-4feb-b1a9-e034d58f0505",
    title: "A Sky Full of Stories",
    description:
      "Every sunset leaves behind a story that words can never fully capture.",
    cloudinary_url:
      "https://res.cloudinary.com/momented/image/upload/v1794680649/momented-prod/rfih4kci9of0ych3aa3m.jpg",
    cloudinary_public_id: "momented-prod/rfih4kci9of0ych3aa3m",
    width: 3591,
    height: 6395,
    camera_make: "motorola",
    camera_model: "moto g64 5G",
    focal_length: "4.3mm",
    aperture: "f/1.8",
    shutter_speed: "1/2278s",
    iso: 107,
    artist: "Jai",
    taken_at: "2026-10-17T17:31:40+00:00",
    created_at: "2026-10-17T17:31:40+00:00",
    fallback_filename: "fallback-portrait.jpg",
  },
];
export function getStaticFallbackPhoto(
  orientation?: string | null,
): StaticFallbackPhoto {
  if (orientation === "portrait") return STATIC_FALLBACK_PHOTOS[1];
  if (orientation === "landscape") return STATIC_FALLBACK_PHOTOS[0];
  return STATIC_FALLBACK_PHOTOS[
    Math.floor(Math.random() * STATIC_FALLBACK_PHOTOS.length)
  ];
}
