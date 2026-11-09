import { ArrowDown, ArrowRight, ArrowUp, Trash2 } from "lucide-react";
import Image from "next/image";
import type { PhotoOption } from "./types";

interface SeriesSlideListProps {
  orderedPhotoIds: string[];
  allPhotos: PhotoOption[];
  coverPhotoId: string | null;
  onMovePhoto: (index: number, direction: -1 | 1) => void;
  onSetCoverPhoto: (id: string) => void;
  onRemovePhoto: (id: string) => void;
}
export default function SeriesSlideList({
  orderedPhotoIds,
  allPhotos,
  coverPhotoId,
  onMovePhoto,
  onSetCoverPhoto,
  onRemovePhoto,
}: SeriesSlideListProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          Slide Sequence ({orderedPhotoIds.length} frames)
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          Use arrows to reorder slides 1
          <ArrowRight size={11} aria-hidden="true" />
          {orderedPhotoIds.length || 1}
        </span>
      </div>
      {orderedPhotoIds.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line/70 bg-soft/40 p-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {orderedPhotoIds.map((pId, idx) => {
            const photo = allPhotos.find((p) => String(p.id) === String(pId));
            if (!photo) return null;
            const isCover = coverPhotoId === String(photo.id);
            return (
              <div
                key={`ordered-${pId}`}
                className={`relative flex flex-col rounded-xl border p-2 transition-all duration-150 ${
                  isCover
                    ? "border-signal/70 bg-surface shadow-xs"
                    : "border-line bg-surface"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-line">
                  <Image
                    src={photo.cloudinary_url}
                    alt={photo.title || "A Momented Photograph"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 150px"
                    className="object-cover"
                  />
                  <span className="absolute top-1 left-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[10px] font-mono text-paper">
                    Slide {idx + 1}
                  </span>
                  {isCover && (
                    <span className="absolute bottom-1 right-1 rounded-sm bg-signal px-1.5 py-0.5 text-[9px] font-medium text-paper">
                      Cover
                    </span>
                  )}
                </div>
                <p className="mt-1.5 truncate text-[11px] text-muted">
                  {photo.title || `Photo #${photo.id}`}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Move slide up"
                      className="rounded p-1 text-muted hover:bg-soft hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, 1)}
                      disabled={idx === orderedPhotoIds.length - 1}
                      aria-label="Move slide down"
                      className="rounded p-1 text-muted hover:bg-soft hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown size={13} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSetCoverPhoto(String(photo.id))}
                      title="Set as series cover photo"
                      aria-label="Set as cover"
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                        isCover
                          ? "bg-signal text-paper"
                          : "text-muted hover:bg-soft hover:text-ink"
                      }`}
                    >
                      Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(String(photo.id))}
                      aria-label="Remove from series"
                      className="rounded p-1 text-muted hover:bg-soft hover:text-danger"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-line bg-soft/30 p-8 text-center text-sm text-muted">
          No slides selected yet. Pick photographs below to add them to this
          series.
        </div>
      )}
    </div>
  );
}
