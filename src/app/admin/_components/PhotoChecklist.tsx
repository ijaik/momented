"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export interface ChecklistPhoto {
  id: string | number;
  cloudinary_url: string;
  title?: string;
}
interface PhotoChecklistProps {
  photos: ChecklistPhoto[];
  linkedPhotos?: ChecklistPhoto[];
  initialCoverId?: string | number | null;
}
const NO_LINKED_PHOTOS: ChecklistPhoto[] = [];
export default function PhotoChecklist({
  photos,
  linkedPhotos = NO_LINKED_PHOTOS,
  initialCoverId = null,
}: PhotoChecklistProps) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [coverId, setCoverId] = useState<string | number | null>(
    initialCoverId,
  );
  useEffect(() => {
    setSelectedIds(linkedPhotos.map((p) => p.id));
    setCoverId(initialCoverId || linkedPhotos[0]?.id || null);
  }, [linkedPhotos, initialCoverId]);
  const handleCheckboxChange = (
    photoId: string | number,
    isChecked: boolean,
  ) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, photoId]);
      if (!coverId) setCoverId(photoId);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== photoId));
      if (coverId === photoId) {
        setCoverId(selectedIds.find((id) => id !== photoId) || null);
      }
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Pick the photographs
        </legend>
        <div className="max-h-80 overflow-y-auto rounded-md border border-line bg-paper p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) => {
              const isChecked = selectedIds.includes(p.id);
              const isCover = coverId === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col rounded-md border p-2 transition-colors ${
                    isCover ? "border-ink/40 bg-soft" : "border-line bg-surface"
                  }`}
                >
                  <div className="relative">
                    <label className="group relative block aspect-square cursor-pointer overflow-hidden rounded-sm bg-soft">
                      <Image
                        src={p.cloudinary_url}
                        alt={p.title || "Photograph"}
                        fill
                        className={`object-cover transition-opacity ${
                          isChecked ? "" : "opacity-60"
                        }`}
                        sizes="160px"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 transition-shadow ${
                          isCover ? "ring-2 ring-inset ring-ink/60" : ""
                        }`}
                      />
                      <input
                        type="checkbox"
                        name="photo_ids"
                        value={p.id}
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(p.id, e.target.checked)
                        }
                        className="absolute left-2 top-2 z-10 h-4 w-4 cursor-pointer accent-solid"
                      />
                      {isCover && (
                        <span className="absolute bottom-2 right-2 z-10 rounded-sm bg-solid px-1.5 py-0.5 text-[10px] font-medium text-on-solid">
                          Cover
                        </span>
                      )}
                    </label>
                  </div>
                  <div className="mt-2 flex min-h-6 flex-col px-0.5">
                    <span className="truncate text-xs text-muted">
                      {p.title}
                    </span>
                    {isChecked && !isCover && (
                      <label className="mt-1 flex cursor-pointer items-center gap-1.5">
                        <input
                          type="radio"
                          name="cover_photo_id"
                          value={p.id}
                          checked={isCover}
                          onChange={() => setCoverId(p.id)}
                          className="h-3.5 w-3.5 cursor-pointer accent-solid"
                        />
                        <span className="text-[11px] text-muted">
                          Use as cover
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>
    </div>
  );
}
