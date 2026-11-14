"use client";
import Image from "next/image";
import { useReducer } from "react";
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
interface ChecklistState {
  selectedIds: (string | number)[];
  coverId: string | number | null;
}
type ChecklistAction =
  | { type: "TOGGLE"; photoId: string | number; checked: boolean }
  | { type: "SET_COVER"; photoId: string | number };
function createInitialChecklistState(
  linkedPhotos: ChecklistPhoto[],
  initialCoverId: string | number | null,
): ChecklistState {
  const selectedIds = linkedPhotos.map((p) => p.id);
  const coverId =
    initialCoverId !== null && selectedIds.includes(initialCoverId)
      ? initialCoverId
      : (selectedIds[0] ?? null);
  return { selectedIds, coverId };
}
function checklistReducer(
  state: ChecklistState,
  action: ChecklistAction,
): ChecklistState {
  switch (action.type) {
    case "TOGGLE": {
      const nextSelected = action.checked
        ? state.selectedIds.includes(action.photoId)
          ? state.selectedIds
          : [...state.selectedIds, action.photoId]
        : state.selectedIds.filter((id) => id !== action.photoId);
      const nextCover =
        nextSelected.length === 0
          ? null
          : state.coverId !== null && nextSelected.includes(state.coverId)
            ? state.coverId
            : (nextSelected[0] ?? null);

      return { selectedIds: nextSelected, coverId: nextCover };
    }
    case "SET_COVER": {
      if (!state.selectedIds.includes(action.photoId)) return state;
      return { ...state, coverId: action.photoId };
    }
  }
}
const NO_LINKED_PHOTOS: ChecklistPhoto[] = [];
export default function PhotoChecklist({
  photos,
  linkedPhotos = NO_LINKED_PHOTOS,
  initialCoverId = null,
}: PhotoChecklistProps) {
  const [state, dispatch] = useReducer(checklistReducer, undefined, () =>
    createInitialChecklistState(linkedPhotos, initialCoverId),
  );
  return (
    <div className="flex flex-col gap-3">
      <input
        id="cover_photo_id"
        type="hidden"
        name="cover_photo_id"
        value={state.coverId !== null ? String(state.coverId) : ""}
      />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Pick the photographs
        </legend>
        <div className="max-h-80 overflow-y-auto rounded-2xl border border-line/80 bg-paper/60 p-3 backdrop-blur-xs">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) => {
              const isChecked = state.selectedIds.includes(p.id);
              const isCover = state.coverId === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col rounded-xl border p-2 transition-all duration-150 ${
                    isCover
                      ? "border-ink/50 bg-soft shadow-xs"
                      : "border-line bg-surface hover:border-ink/20"
                  }`}
                >
                  <div className="relative">
                    <label
                      htmlFor={`photo-checkbox-${p.id}`}
                      className="group relative block aspect-square cursor-pointer overflow-hidden rounded-lg bg-soft"
                    >
                      <Image
                        src={p.cloudinary_url}
                        alt={p.title || "A Momented Photograph"}
                        fill
                        className={`object-cover transition-opacity ${
                          isChecked ? "" : "opacity-60"
                        }`}
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 transition-shadow ${
                          isCover ? "ring-2 ring-inset ring-ink/60" : ""
                        }`}
                      />
                      <input
                        id={`photo-checkbox-${p.id}`}
                        type="checkbox"
                        name="photo_ids"
                        value={p.id}
                        checked={isChecked}
                        onChange={(e) =>
                          dispatch({
                            type: "TOGGLE",
                            photoId: p.id,
                            checked: e.target.checked,
                          })
                        }
                        className="absolute left-2 top-2 z-10 h-4 w-4 cursor-pointer accent-solid"
                      />
                      {isCover && (
                        <span className="absolute bottom-2 right-2 z-10 rounded-full bg-solid/90 px-2 py-0.5 text-[10px] font-medium text-on-solid shadow-xs backdrop-blur-md">
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
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: "SET_COVER", photoId: p.id })
                        }
                        className="mt-1 flex cursor-pointer items-center gap-1.5 text-left active:scale-98 duration-100 transition-transform"
                      >
                        <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-muted" />
                        <span className="text-[11px] text-muted">
                          Use as cover
                        </span>
                      </button>
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
