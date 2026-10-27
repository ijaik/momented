import { Camera, CircleDot, Clock, Film } from "lucide-react";
import type { Photo } from "@/types";

interface ExifSpecGridProps {
  photo: Pick<
    Photo,
    "camera_model" | "focal_length" | "aperture" | "shutter_speed" | "iso"
  >;
  compact?: boolean;
}
export function hasPhotoExif(
  photo: Pick<
    Photo,
    "camera_model" | "focal_length" | "aperture" | "shutter_speed" | "iso"
  >,
): boolean {
  return Boolean(
    photo.camera_model ||
      photo.focal_length ||
      photo.aperture ||
      photo.shutter_speed ||
      photo.iso,
  );
}
export default function ExifSpecGrid({
  photo,
  compact = false,
}: ExifSpecGridProps) {
  const specs = [
    {
      label: "Focal",
      value: photo.focal_length || "—",
      icon: <CircleDot size={compact ? 11 : 13} aria-hidden="true" />,
    },
    {
      label: "Aperture",
      value: photo.aperture || "—",
      icon: (
        <span className="font-serif text-xs font-bold leading-none">ƒ</span>
      ),
    },
    {
      label: "Shutter",
      value: photo.shutter_speed || "—",
      icon: <Clock size={compact ? 11 : 13} aria-hidden="true" />,
    },
    {
      label: "ISO",
      value: photo.iso ? `ISO ${photo.iso}` : "—",
      icon: <Film size={compact ? 11 : 13} aria-hidden="true" />,
    },
  ];
  return (
    <div className={compact ? "mt-3.5 space-y-3" : ""}>
      {photo.camera_model && (
        <div
          className={`flex items-center border-b border-line/60 ${
            compact ? "gap-2.5 pb-2.5" : "mb-4 gap-3 pb-3"
          }`}
        >
          <span
            className={`flex shrink-0 items-center justify-center border border-line/60 bg-soft/80 text-ink ${
              compact ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl"
            }`}
          >
            <Camera size={compact ? 14 : 18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <span
              className={`block font-semibold uppercase tracking-wider text-muted ${
                compact ? "text-[10px]" : "text-[11px]"
              }`}
            >
              {compact ? "Camera" : "Camera Body"}
            </span>
            <p
              className={`truncate font-medium text-ink ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {photo.camera_model}
            </p>
          </div>
        </div>
      )}
      <dl
        className={`grid grid-cols-2 sm:grid-cols-4 ${
          compact ? "gap-2 text-xs" : "gap-3"
        }`}
      >
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="rounded-xl border border-line/60 bg-soft/40 p-2.5 backdrop-blur-xs"
          >
            <dt
              className={`flex items-center text-[10px] font-semibold uppercase tracking-wider text-muted ${
                compact ? "gap-1" : "gap-1.5"
              }`}
            >
              {spec.icon}
              <span>{spec.label}</span>
            </dt>
            <dd
              className={`font-sans font-semibold tabular-nums text-ink ${
                compact ? "mt-0.5 text-xs" : "mt-1 text-sm"
              }`}
            >
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
