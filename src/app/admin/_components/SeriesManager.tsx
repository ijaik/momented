"use client";
import { Plus, Upload } from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type SubmitEvent,
  useEffect,
  useReducer,
  useRef,
  useTransition,
} from "react";
import { deletePhotoAction } from "@/actions/photos";
import {
  createSeriesAction,
  deleteSeriesAction,
  editSeriesAction,
} from "@/actions/series";
import {
  getCloudinarySignatureAction,
  savePhotoToDbAction,
} from "@/actions/upload";
import Button from "@/components/ui/Button";
import {
  confirmAction,
  notifyError,
  notifySuccess,
} from "@/components/ui/notifications";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary/uploadClient";
import {
  FieldLabel,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "./AdminForms";
import SeriesCardList from "./series/SeriesCardList";
import SeriesSlideList from "./series/SeriesSlideList";
import SeriesUploadQueue from "./series/SeriesUploadQueue";
import type {
  PhotoOption,
  QueuedSlideFile,
  SeriesAdminItem,
} from "./series/types";
export type { SeriesAdminItem, PhotoOption, QueuedSlideFile };
interface SeriesManagerProps {
  series: SeriesAdminItem[];
  allPhotos: PhotoOption[];
}
function revokePreviews(items: QueuedSlideFile[]) {
  for (const item of items)
    if (item.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
}
type UploadPhase =
  | { status: "idle" }
  | { status: "signing"; total: number }
  | { status: "uploading"; current: number; total: number; detail: string }
  | { status: "assembling" }
  | { status: "rolling-back" };
type SeriesEditorState =
  | { mode: "closed" }
  | {
      mode: "create-library";
      orderedPhotoIds: string[];
      coverPhotoId: string | null;
    }
  | {
      mode: "create-upload";
      queuedFiles: QueuedSlideFile[];
      uploadPhase: UploadPhase;
    }
  | {
      mode: "edit";
      series: SeriesAdminItem;
      orderedPhotoIds: string[];
      coverPhotoId: string | null;
    };
type SeriesEditorAction =
  | { type: "OPEN_CREATE_LIBRARY" }
  | { type: "OPEN_CREATE_UPLOAD" }
  | { type: "OPEN_EDIT"; series: SeriesAdminItem }
  | { type: "CLOSE" }
  | { type: "TOGGLE_LIBRARY_PHOTO"; photoId: string }
  | { type: "REMOVE_LIBRARY_PHOTO"; photoId: string }
  | { type: "MOVE_LIBRARY_PHOTO"; index: number; direction: -1 | 1 }
  | { type: "SET_COVER_PHOTO"; photoId: string }
  | { type: "ADD_QUEUED_FILES"; items: QueuedSlideFile[] }
  | { type: "MOVE_QUEUED_FILE"; index: number; direction: -1 | 1 }
  | { type: "REMOVE_QUEUED_FILE"; index: number }
  | { type: "CLEAR_QUEUED_FILES" }
  | {
      type: "UPDATE_QUEUED_META";
      index: number;
      title?: string;
      description?: string;
    }
  | { type: "SET_UPLOAD_PHASE"; phase: UploadPhase };
function normalizeCover(
  orderedIds: string[],
  currentCover: string | null,
): string | null {
  if (orderedIds.length === 0) return null;
  if (currentCover && orderedIds.includes(currentCover)) return currentCover;
  return orderedIds[0];
}
function seriesEditorReducer(
  state: SeriesEditorState,
  action: SeriesEditorAction,
): SeriesEditorState {
  switch (action.type) {
    case "OPEN_CREATE_LIBRARY":
      return {
        mode: "create-library",
        orderedPhotoIds: [],
        coverPhotoId: null,
      };
    case "OPEN_CREATE_UPLOAD":
      return {
        mode: "create-upload",
        queuedFiles: [],
        uploadPhase: { status: "idle" },
      };
    case "OPEN_EDIT": {
      const orderedPhotoIds = action.series.photos.map((p) => String(p.id));
      return {
        mode: "edit",
        series: action.series,
        orderedPhotoIds,
        coverPhotoId: normalizeCover(
          orderedPhotoIds,
          action.series.cover_photo_id ?? null,
        ),
      };
    }
    case "CLOSE":
      return { mode: "closed" };
    case "TOGGLE_LIBRARY_PHOTO": {
      if (state.mode !== "create-library" && state.mode !== "edit")
        return state;
      const exists = state.orderedPhotoIds.includes(action.photoId);
      const nextIds = exists
        ? state.orderedPhotoIds.filter((id) => id !== action.photoId)
        : [...state.orderedPhotoIds, action.photoId];
      return {
        ...state,
        orderedPhotoIds: nextIds,
        coverPhotoId: normalizeCover(nextIds, state.coverPhotoId),
      };
    }
    case "REMOVE_LIBRARY_PHOTO": {
      if (state.mode !== "create-library" && state.mode !== "edit")
        return state;
      const nextIds = state.orderedPhotoIds.filter(
        (id) => id !== action.photoId,
      );
      return {
        ...state,
        orderedPhotoIds: nextIds,
        coverPhotoId: normalizeCover(nextIds, state.coverPhotoId),
      };
    }
    case "MOVE_LIBRARY_PHOTO": {
      if (state.mode !== "create-library" && state.mode !== "edit")
        return state;
      const target = action.index + action.direction;
      if (target < 0 || target >= state.orderedPhotoIds.length) return state;
      const copy = [...state.orderedPhotoIds];
      const temp = copy[action.index];
      copy[action.index] = copy[target];
      copy[target] = temp;
      return { ...state, orderedPhotoIds: copy };
    }
    case "SET_COVER_PHOTO": {
      if (state.mode !== "create-library" && state.mode !== "edit")
        return state;
      if (!state.orderedPhotoIds.includes(action.photoId)) return state;
      return { ...state, coverPhotoId: action.photoId };
    }
    case "ADD_QUEUED_FILES": {
      if (state.mode !== "create-upload" || state.uploadPhase.status !== "idle")
        return state;
      return { ...state, queuedFiles: [...state.queuedFiles, ...action.items] };
    }
    case "MOVE_QUEUED_FILE": {
      if (state.mode !== "create-upload" || state.uploadPhase.status !== "idle")
        return state;
      const target = action.index + action.direction;
      if (target < 0 || target >= state.queuedFiles.length) return state;
      const copy = [...state.queuedFiles];
      const temp = copy[action.index];
      copy[action.index] = copy[target];
      copy[target] = temp;
      return { ...state, queuedFiles: copy };
    }
    case "REMOVE_QUEUED_FILE": {
      if (state.mode !== "create-upload" || state.uploadPhase.status !== "idle")
        return state;
      return {
        ...state,
        queuedFiles: state.queuedFiles.filter((_, i) => i !== action.index),
      };
    }
    case "CLEAR_QUEUED_FILES": {
      if (state.mode !== "create-upload" || state.uploadPhase.status !== "idle")
        return state;
      return { ...state, queuedFiles: [] };
    }
    case "UPDATE_QUEUED_META": {
      if (state.mode !== "create-upload" || state.uploadPhase.status !== "idle")
        return state;
      const copy = [...state.queuedFiles];
      copy[action.index] = {
        ...copy[action.index],
        ...(action.title !== undefined ? { title: action.title } : {}),
        ...(action.description !== undefined
          ? { description: action.description }
          : {}),
      };
      return { ...state, queuedFiles: copy };
    }
    case "SET_UPLOAD_PHASE": {
      if (state.mode !== "create-upload") return state;
      return { ...state, uploadPhase: action.phase };
    }
  }
}
function getUploadStatusText(phase: UploadPhase): string {
  switch (phase.status) {
    case "idle":
      return "";
    case "signing":
      return `Preparing ${phase.total} slides for upload…`;
    case "uploading":
      return `Slide ${phase.current}/${phase.total}: ${phase.detail}`;
    case "assembling":
      return "Assembling photo series…";
    case "rolling-back":
      return "Rolling back incomplete uploads…";
  }
}
export default function SeriesManager({
  series,
  allPhotos,
}: SeriesManagerProps) {
  const [editorState, dispatch] = useReducer(seriesEditorReducer, {
    mode: "closed",
  });
  const queuedFilesRef = useRef<QueuedSlideFile[]>([]);
  const [isFormPending, startFormTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  useEffect(() => {
    if (editorState.mode === "create-upload")
      queuedFilesRef.current = editorState.queuedFiles;
    else queuedFilesRef.current = [];
  }, [editorState]);
  useEffect(() => {
    return () => {
      revokePreviews(queuedFilesRef.current);
    };
  }, []);
  const clearQueuedFiles = () => {
    if (editorState.mode !== "create-upload") return;
    revokePreviews(editorState.queuedFiles);
    dispatch({ type: "CLEAR_QUEUED_FILES" });
  };
  const removeQueuedFile = (index: number) => {
    if (editorState.mode !== "create-upload") return;
    const removed = editorState.queuedFiles[index];
    if (removed?.preview.startsWith("blob:"))
      URL.revokeObjectURL(removed.preview);
    dispatch({ type: "REMOVE_QUEUED_FILE", index });
  };
  const switchToLibraryMode = () => {
    if (editorState.mode === "create-upload")
      revokePreviews(editorState.queuedFiles);
    dispatch({ type: "OPEN_CREATE_LIBRARY" });
  };
  const switchToUploadMode = () => {
    dispatch({ type: "OPEN_CREATE_UPLOAD" });
  };
  const closeForm = () => {
    if (editorState.mode === "create-upload")
      revokePreviews(editorState.queuedFiles);
    dispatch({ type: "CLOSE" });
  };
  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems: QueuedSlideFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: "",
      description: "",
    }));
    dispatch({ type: "ADD_QUEUED_FILES", items: newItems });
  };
  async function handleLibrarySubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editorState.mode !== "create-library" && editorState.mode !== "edit")
      return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.delete("photo_ids");
    for (const pid of editorState.orderedPhotoIds)
      formData.append("photo_ids", pid);
    if (editorState.coverPhotoId)
      formData.set("cover_photo_id", editorState.coverPhotoId);
    startFormTransition(async () => {
      try {
        if (editorState.mode === "edit") {
          await editSeriesAction(editorState.series.id, formData);
          notifySuccess("Series updated.");
        } else {
          await createSeriesAction(formData);
          notifySuccess("Series created.");
        }
        closeForm();
      } catch (err) {
        notifyError(
          err instanceof Error ? err.message : "Failed to save series.",
        );
      }
    });
  }
  async function handleBatchUploadSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editorState.mode !== "create-upload") return;
    const queuedFiles = editorState.queuedFiles;
    if (queuedFiles.length === 0) {
      notifyError("Please select at least one photo to upload.");
      return;
    }
    const form = e.currentTarget;
    const title = (
      form.elements.namedItem("title") as HTMLInputElement
    )?.value?.trim();
    const description =
      (
        form.elements.namedItem("description") as HTMLTextAreaElement
      )?.value?.trim() || null;
    if (!title) {
      notifyError("Series title is required.");
      return;
    }
    startFormTransition(async () => {
      const uploadedPhotos: { id: string; publicId: string; index: number }[] =
        [];
      try {
        const total = queuedFiles.length;
        dispatch({
          type: "SET_UPLOAD_PHASE",
          phase: { status: "signing", total },
        });
        const signData = await getCloudinarySignatureAction();
        const CONCURRENCY = 3;
        for (let start = 0; start < total; start += CONCURRENCY) {
          const batch = queuedFiles.slice(start, start + CONCURRENCY);
          await Promise.all(
            batch.map(async (item, batchIdx) => {
              const i = start + batchIdx;
              const uploadData = await uploadPhotoToCloudinary(item.file, {
                signatureData: signData,
                onStatusChange: (s) =>
                  dispatch({
                    type: "SET_UPLOAD_PHASE",
                    phase: {
                      status: "uploading",
                      current: i + 1,
                      total,
                      detail: s,
                    },
                  }),
              });
              dispatch({
                type: "SET_UPLOAD_PHASE",
                phase: {
                  status: "uploading",
                  current: i + 1,
                  total,
                  detail: "Saving to database…",
                },
              });
              const slideTitle =
                item.title.trim() || `${title} — Frame ${i + 1}`;
              const slideDescription =
                item.description.trim() || description || undefined;
              const saveResult = await savePhotoToDbAction({
                title: slideTitle,
                description: slideDescription,
                secure_url: uploadData.secure_url,
                public_id: uploadData.public_id,
                width: uploadData.width,
                height: uploadData.height,
                image_metadata: uploadData.image_metadata,
              });
              if (!saveResult.id)
                throw new Error(`Failed to save slide ${i + 1} to database.`);
              uploadedPhotos.push({
                id: saveResult.id,
                publicId: uploadData.public_id,
                index: i,
              });
            }),
          );
        }
        uploadedPhotos.sort((a, b) => a.index - b.index);
        dispatch({
          type: "SET_UPLOAD_PHASE",
          phase: { status: "assembling" },
        });
        const seriesFormData = new FormData();
        seriesFormData.append("title", title);
        if (description) seriesFormData.append("description", description);
        if (uploadedPhotos[0])
          seriesFormData.append("cover_photo_id", uploadedPhotos[0].id);
        for (const p of uploadedPhotos)
          seriesFormData.append("photo_ids", p.id);
        await createSeriesAction(seriesFormData);
        notifySuccess("Series and frames created successfully.");
        closeForm();
      } catch (err) {
        if (uploadedPhotos.length > 0) {
          dispatch({
            type: "SET_UPLOAD_PHASE",
            phase: { status: "rolling-back" },
          });
          await Promise.allSettled(
            uploadedPhotos.map((p) => deletePhotoAction(p.id, p.publicId)),
          );
        }
        notifyError(
          err instanceof Error ? err.message : "Failed to create series.",
        );
      } finally {
        dispatch({
          type: "SET_UPLOAD_PHASE",
          phase: { status: "idle" },
        });
      }
    });
  }
  async function handleDelete(id: string) {
    const confirmed = await confirmAction({
      title: "Delete Series",
      message:
        "Are you sure you want to delete this series? The individual photographs will remain safe and will NOT be deleted.",
      confirmLabel: "Delete",
      isDestructive: true,
    });
    if (!confirmed) return;
    startDeleteTransition(async () => {
      try {
        await deleteSeriesAction(id);
        notifySuccess("Series deleted.");
      } catch (err) {
        notifyError(
          err instanceof Error ? err.message : "Failed to delete series.",
        );
      }
    });
  }
  const isFormOpen = editorState.mode !== "closed";
  const editingSeries = editorState.mode === "edit" ? editorState.series : null;
  const isUploadMode = editorState.mode === "create-upload";
  const queuedFiles =
    editorState.mode === "create-upload" ? editorState.queuedFiles : [];
  const uploadPhase =
    editorState.mode === "create-upload"
      ? editorState.uploadPhase
      : { status: "idle" as const };
  const uploadStatusText = getUploadStatusText(uploadPhase);
  const orderedPhotoIds =
    editorState.mode === "create-library" || editorState.mode === "edit"
      ? editorState.orderedPhotoIds
      : [];
  const coverPhotoId =
    editorState.mode === "create-library" || editorState.mode === "edit"
      ? editorState.coverPhotoId
      : null;
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">Photo Series</h2>
          <p className="mt-1 text-sm text-muted">
            Curate ordered multi-photo narratives and moment progressions.
          </p>
        </div>
        {!isFormOpen && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={switchToUploadMode}
              className="inline-flex items-center gap-1.5"
            >
              <Upload size={14} aria-hidden="true" />
              <span>Batch Upload Series</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={switchToLibraryMode}
              className="inline-flex items-center gap-1.5"
            >
              <Plus size={14} aria-hidden="true" />
              <span>Pick From Library</span>
            </Button>
          </div>
        )}
      </div>
      {isFormOpen && (
        <section
          aria-label={editingSeries ? "Edit series" : "Create new series"}
          className="rounded-2xl border border-line/70 bg-surface/80 p-6 shadow-xs backdrop-blur-md sm:p-7"
        >
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-serif text-xl text-ink">
                {editingSeries ? "Edit Series" : "New Photo Series"}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {editingSeries
                  ? "Adjust title, description, and rearrange slides"
                  : isUploadMode
                    ? "Upload multiple photographs in exact slide order"
                    : "Select and order existing photographs from your library"}
              </p>
            </div>
            {!editingSeries && (
              <div className="inline-flex rounded-full border border-line/70 bg-soft/60 p-1 text-xs backdrop-blur-xs">
                <button
                  type="button"
                  onClick={switchToLibraryMode}
                  className={`rounded-full px-3.5 py-1 font-medium transition-all duration-150 active:scale-98 cursor-pointer ${
                    editorState.mode === "create-library"
                      ? "bg-surface text-ink shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  From Library
                </button>
                <button
                  type="button"
                  onClick={switchToUploadMode}
                  className={`rounded-full px-3.5 py-1 font-medium transition-all duration-150 active:scale-98 cursor-pointer ${
                    isUploadMode
                      ? "bg-surface text-ink shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Direct Upload
                </button>
              </div>
            )}
          </div>
          {isUploadMode ? (
            <form onSubmit={handleBatchUploadSubmit} className="space-y-6">
              <div>
                <FieldLabel htmlFor="series-upload-title">
                  Series Title *
                </FieldLabel>
                <FormInput
                  id="series-upload-title"
                  name="title"
                  placeholder="e.g. Flight into Dusk — 4 frames"
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="series-upload-desc">
                  Description (optional)
                </FieldLabel>
                <FormTextarea
                  id="series-upload-desc"
                  name="description"
                  placeholder="A few words on the sequence, time, and atmosphere…"
                  rows={2}
                />
              </div>
              <div>
                <FieldLabel as="span">Select Photographs in Order *</FieldLabel>
                <div className="mt-1 flex items-center justify-center rounded-2xl border-2 border-dashed border-line/80 bg-soft/20 px-6 py-8 text-center transition-colors hover:border-ink/30">
                  <div className="flex flex-col items-center">
                    <Upload
                      size={28}
                      className="mb-2 text-muted"
                      aria-hidden="true"
                    />
                    <label
                      htmlFor="series-file-input"
                      className="cursor-pointer text-sm font-medium text-ink underline underline-offset-4 hover:opacity-80"
                    >
                      Choose files to queue
                    </label>
                    <input
                      id="series-file-input"
                      name="series_files"
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadPhase.status !== "idle"}
                      onChange={handleFilesSelected}
                      className="sr-only"
                    />
                    <p className="mt-1 text-xs text-muted">
                      JPG, PNG, WebP up to 50MB. Dragging or selecting multiple
                      photos preserves their order.
                    </p>
                  </div>
                </div>
              </div>
              <SeriesUploadQueue
                queuedFiles={queuedFiles}
                disabled={uploadPhase.status !== "idle"}
                onClear={clearQueuedFiles}
                onMove={(index, direction) =>
                  dispatch({ type: "MOVE_QUEUED_FILE", index, direction })
                }
                onRemove={removeQueuedFile}
                onUpdateTitle={(index, title) =>
                  dispatch({ type: "UPDATE_QUEUED_META", index, title })
                }
                onUpdateDescription={(index, description) =>
                  dispatch({
                    type: "UPDATE_QUEUED_META",
                    index,
                    description,
                  })
                }
              />
              {uploadStatusText && (
                <div
                  aria-live="polite"
                  className="rounded-md border border-line bg-soft px-4 py-2 text-xs font-mono text-muted"
                >
                  {uploadStatusText}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={closeForm}
                  disabled={isFormPending}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isLoading={isFormPending}
                  loadingText="Processing batch upload…"
                  text={`Upload & Create Series (${queuedFiles.length} slides)`}
                  disabled={queuedFiles.length === 0}
                />
              </div>
            </form>
          ) : (
            <form onSubmit={handleLibrarySubmit} className="space-y-6">
              <div>
                <FieldLabel htmlFor="series-title">Series Title *</FieldLabel>
                <FormInput
                  id="series-title"
                  name="title"
                  defaultValue={editingSeries?.title || ""}
                  placeholder="e.g. Shifting Shadows"
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="series-desc">
                  Description (optional)
                </FieldLabel>
                <FormTextarea
                  id="series-desc"
                  name="description"
                  defaultValue={editingSeries?.description || ""}
                  placeholder="Narrative notes regarding this collection of frames…"
                  rows={2}
                />
              </div>
              <SeriesSlideList
                orderedPhotoIds={orderedPhotoIds}
                allPhotos={allPhotos}
                coverPhotoId={coverPhotoId}
                onMovePhoto={(index, direction) =>
                  dispatch({
                    type: "MOVE_LIBRARY_PHOTO",
                    index,
                    direction,
                  })
                }
                onSetCoverPhoto={(photoId) =>
                  dispatch({ type: "SET_COVER_PHOTO", photoId })
                }
                onRemovePhoto={(photoId) =>
                  dispatch({ type: "REMOVE_LIBRARY_PHOTO", photoId })
                }
              />
              <div>
                <FieldLabel as="span">
                  Select Photographs From Library
                </FieldLabel>
                <div className="max-h-72 overflow-y-auto rounded-2xl border border-line/70 bg-paper/60 p-3 backdrop-blur-xs">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {allPhotos.map((photo) => {
                      const isSelected = orderedPhotoIds.includes(
                        String(photo.id),
                      );
                      const slideNumber =
                        orderedPhotoIds.indexOf(String(photo.id)) + 1;
                      return (
                        <button
                          key={`lib-${photo.id}`}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "TOGGLE_LIBRARY_PHOTO",
                              photoId: String(photo.id),
                            })
                          }
                          className={`flex flex-col rounded-xl border p-2 text-left transition-all duration-150 active:scale-98 cursor-pointer ${
                            isSelected
                              ? "border-signal/70 bg-soft shadow-xs"
                              : "border-line bg-surface hover:border-ink/20"
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
                            {isSelected && (
                              <span className="absolute top-1 right-1 rounded-full bg-signal px-1.5 py-0.5 text-[10px] font-bold text-paper">
                                #{slideNumber}
                              </span>
                            )}
                          </div>
                          <span className="mt-1.5 truncate text-xs font-medium text-ink">
                            {photo.title || "Untitled Momented"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={closeForm}
                  disabled={isFormPending}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isLoading={isFormPending}
                  loadingText="Saving series…"
                  text={
                    editingSeries
                      ? "Save Changes"
                      : `Create Series (${orderedPhotoIds.length} slides)`
                  }
                  disabled={orderedPhotoIds.length === 0}
                />
              </div>
            </form>
          )}
        </section>
      )}
      <SeriesCardList
        series={series}
        isPending={isDeletePending || isFormPending}
        onEdit={(item) => dispatch({ type: "OPEN_EDIT", series: item })}
        onDelete={handleDelete}
      />
    </div>
  );
}
