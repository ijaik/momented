import { Aperture, Camera, CircleDot, Clock, Film } from "lucide-react";
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
      icon: <CircleDot size={compact ? 11 : 12} aria-hidden="true" />,
    },
    {
      label: "Aperture",
      value: photo.aperture || "—",
      icon: <Aperture size={compact ? 11 : 12} aria-hidden="true" />,
    },
    {
      label: "Shutter",
      value: photo.shutter_speed || "—",
      icon: <Clock size={compact ? 11 : 12} aria-hidden="true" />,
    },
    {
      label: "ISO",
      value: photo.iso ? `ISO ${photo.iso}` : "—",
      icon: <Film size={compact ? 11 : 12} aria-hidden="true" />,
    },
  ];
  return (
    <div className={compact ? "mt-3 space-y-2.5" : "space-y-3"}>
      {photo.camera_model && (
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-line">
          <Camera
            size={14}
            className="text-muted shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-muted">
              Camera Body
            </span>
            <p className="truncate font-mono text-xs sm:text-sm font-medium text-ink">
              {photo.camera_model}
            </p>
          </div>
        </div>
      )}
      <dl className="grid grid-cols-2 sm:grid-cols-4 border border-line divide-x divide-y sm:divide-y-0 divide-line bg-surface">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className={`${compact ? "p-2" : "p-2.5 sm:p-3"} flex flex-col justify-between`}
          >
            <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span className="text-muted/70">{spec.icon}</span>
              <span>{spec.label}</span>
            </dt>
            <dd
              className={`font-mono font-medium tabular-nums text-ink ${
                compact ? "mt-1 text-xs" : "mt-1.5 text-xs sm:text-sm"
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
