"use client";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type SubmitEvent,
  useState,
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
import { compressImageWithExif } from "@/lib/utils/imageCompression";
import {
  FieldLabel,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "./AdminForms";
export interface SeriesItemPhoto {
  id: string;
  title?: string | null;
  cloudinary_url: string;
}
export interface SeriesAdminItem {
  id: string;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  created_at: string;
  photos: SeriesItemPhoto[];
}
interface PhotoOption {
  id: string | number;
  title?: string | null;
  cloudinary_url: string;
}
export interface QueuedSlideFile {
  file: File;
  preview: string;
  title: string;
  description: string;
}
interface SeriesManagerProps {
  series: SeriesAdminItem[];
  allPhotos: PhotoOption[];
}
export default function SeriesManager({
  series,
  allPhotos,
}: SeriesManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesAdminItem | null>(
    null,
  );
  const [creationMode, setCreationMode] = useState<"library" | "upload">(
    "library",
  );
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<string[]>([]);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [queuedFiles, setQueuedFiles] = useState<QueuedSlideFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const openCreateForm = (mode: "library" | "upload" = "library") => {
    setEditingSeries(null);
    setCreationMode(mode);
    setOrderedPhotoIds([]);
    setCoverPhotoId(null);
    setQueuedFiles([]);
    setUploadStatus("");
    setIsCreating(true);
  };
  const openEditForm = (item: SeriesAdminItem) => {
    setIsCreating(false);
    setEditingSeries(item);
    setOrderedPhotoIds(item.photos.map((p) => String(p.id)));
    setCoverPhotoId(item.cover_photo_id || item.photos[0]?.id || null);
    setQueuedFiles([]);
    setUploadStatus("");
  };
  const closeForm = () => {
    setIsCreating(false);
    setEditingSeries(null);
    setOrderedPhotoIds([]);
    setCoverPhotoId(null);
    setQueuedFiles([]);
    setUploadStatus("");
  };
  const movePhoto = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedPhotoIds.length) return;
    setOrderedPhotoIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };
  const removePhotoFromQueue = (id: string) => {
    setOrderedPhotoIds((prev) => prev.filter((pId) => pId !== id));
    if (coverPhotoId === id) {
      setCoverPhotoId(orderedPhotoIds.find((pId) => pId !== id) || null);
    }
  };
  const togglePhotoSelection = (id: string) => {
    if (orderedPhotoIds.includes(id)) {
      removePhotoFromQueue(id);
    } else {
      setOrderedPhotoIds((prev) => [...prev, id]);
      if (!coverPhotoId) setCoverPhotoId(id);
    }
  };
  const moveQueuedFile = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= queuedFiles.length) return;
    setQueuedFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };
  const removeQueuedFile = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const updateQueuedSlideTitle = (index: number, title: string) => {
    setQueuedFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title };
      return copy;
    });
  };
  const updateQueuedSlideDescription = (index: number, description: string) => {
    setQueuedFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description };
      return copy;
    });
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
    setQueuedFiles((prev) => [...prev, ...newItems]);
  };
  async function handleLibrarySubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.delete("photo_ids");
    for (const pid of orderedPhotoIds) {
      formData.append("photo_ids", pid);
    }
    if (coverPhotoId) {
      formData.set("cover_photo_id", coverPhotoId);
    }
    startTransition(async () => {
      try {
        if (editingSeries) {
          await editSeriesAction(editingSeries.id, formData);
        } else {
          await createSeriesAction(formData);
        }
        closeForm();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to save series.");
      }
    });
  }
  async function handleBatchUploadSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (queuedFiles.length === 0) {
      alert("Please select at least one photo to upload.");
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
      alert("Series title is required.");
      return;
    }
    startTransition(async () => {
      const uploadedPhotos: { id: string; publicId: string }[] = [];
      try {
        const total = queuedFiles.length;
        for (let i = 0; i < total; i++) {
          const item = queuedFiles[i];
          setUploadStatus(`Compressing slide ${i + 1} of ${total}…`);
          const fileToUpload = await compressImageWithExif(item.file, (s) =>
            setUploadStatus(`Slide ${i + 1}/${total}: ${s}`),
          );
          setUploadStatus(`Uploading slide ${i + 1} of ${total}…`);
          const signData = await getCloudinarySignatureAction();
          const uploadFormData = new FormData();
          uploadFormData.append("file", fileToUpload);
          uploadFormData.append("api_key", signData.apiKey);
          uploadFormData.append("timestamp", signData.timestamp.toString());
          uploadFormData.append("signature", signData.signature);
          uploadFormData.append("folder", signData.folder);
          uploadFormData.append("image_metadata", "true");
          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
            { method: "POST", body: uploadFormData },
          );
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload slide ${i + 1} to Cloudinary.`);
          }
          const uploadData = await uploadRes.json();
          setUploadStatus(`Saving slide ${i + 1} of ${total} to database…`);
          const slideTitle = item.title.trim() || `${title} — Frame ${i + 1}`;
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
          });
        }
        setUploadStatus("Assembling photo series…");
        const seriesFormData = new FormData();
        seriesFormData.append("title", title);
        if (description) seriesFormData.append("description", description);
        if (uploadedPhotos[0])
          seriesFormData.append("cover_photo_id", uploadedPhotos[0].id);
        for (const p of uploadedPhotos)
          seriesFormData.append("photo_ids", p.id);
        await createSeriesAction(seriesFormData);
        closeForm();
      } catch (err) {
        if (uploadedPhotos.length > 0) {
          setUploadStatus("Rolling back incomplete uploads…");
          await Promise.allSettled(
            uploadedPhotos.map((p) => deletePhotoAction(p.id, p.publicId)),
          );
        }
        alert(err instanceof Error ? err.message : "Failed to create series.");
      } finally {
        setUploadStatus("");
      }
    });
  }
  async function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this series? The individual photographs will remain safe and will NOT be deleted.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteSeriesAction(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete series.");
      }
    });
  }
  const isFormOpen = isCreating || Boolean(editingSeries);
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ink">
            Photo Series
          </h2>
          <p className="mt-1 text-sm text-muted">
            Curate ordered multi-photo narratives and moment progressions.
          </p>
        </div>
        {!isFormOpen && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => openCreateForm("upload")}
              className="inline-flex items-center gap-1.5"
            >
              <Upload size={14} aria-hidden="true" />
              <span>Batch Upload Series</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openCreateForm("library")}
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
          className="rounded-lg border border-line bg-surface p-6 shadow-xs"
        >
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-serif text-xl font-medium text-ink">
                {editingSeries ? "Edit Series" : "New Photo Series"}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {editingSeries
                  ? "Adjust title, description, and rearrange slides"
                  : creationMode === "upload"
                    ? "Upload multiple photographs in exact slide order"
                    : "Select and order existing photographs from your library"}
              </p>
            </div>
            {!editingSeries && (
              <div className="inline-flex rounded-md border border-line bg-soft/50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCreationMode("library")}
                  className={`rounded-sm px-3 py-1 font-medium transition-colors ${
                    creationMode === "library"
                      ? "bg-surface text-ink shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  From Library
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("upload")}
                  className={`rounded-sm px-3 py-1 font-medium transition-colors ${
                    creationMode === "upload"
                      ? "bg-surface text-ink shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Direct Upload
                </button>
              </div>
            )}
          </div>
          {isCreating && creationMode === "upload" ? (
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
                <FieldLabel htmlFor="series-file-input">
                  Select Photographs in Order *
                </FieldLabel>
                <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-line bg-soft/30 px-6 py-8 text-center transition-colors hover:border-ink/30">
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
                      type="file"
                      multiple
                      accept="image/*"
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
              {queuedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                      Queued Slides ({queuedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setQueuedFiles([])}
                      className="text-xs text-muted hover:text-ink"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {queuedFiles.map((item, idx) => (
                      <div
                        key={`queued-${item.file.name}-${idx}`}
                        className="group relative flex flex-col gap-3 rounded-lg border border-line bg-soft/40 p-3 sm:flex-row sm:items-start"
                      >
                        <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                          <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-line sm:h-24 sm:w-24">
                            <Image
                              unoptimized
                              src={item.preview}
                              alt={item.title || "A Momented Photograph"}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                            <span className="absolute top-1 left-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[10px] font-mono text-paper">
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:justify-center">
                            <button
                              type="button"
                              onClick={() => moveQueuedFile(idx, -1)}
                              disabled={idx === 0}
                              aria-label="Move slide up"
                              title="Move slide up"
                              className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                            >
                              <ArrowUp size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveQueuedFile(idx, 1)}
                              disabled={idx === queuedFiles.length - 1}
                              aria-label="Move slide down"
                              title="Move slide down"
                              className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                            >
                              <ArrowDown size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQueuedFile(idx)}
                              aria-label="Remove slide from queue"
                              title="Remove slide from queue"
                              className="rounded p-1 text-muted hover:bg-surface hover:text-danger"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-ink">
                              Slide {idx + 1}
                            </span>
                            <span className="truncate text-[11px] text-muted">
                              {item.file.name}
                            </span>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                updateQueuedSlideTitle(idx, e.target.value)
                              }
                              placeholder={`Slide title (leave empty for auto: Frame ${idx + 1})`}
                              className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-ink focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) =>
                                updateQueuedSlideDescription(
                                  idx,
                                  e.target.value,
                                )
                              }
                              placeholder="Slide description / caption (optional, defaults to series description)"
                              className="w-full resize-none rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-ink focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {uploadStatus && (
                <div
                  aria-live="polite"
                  className="rounded-md border border-line bg-soft px-4 py-2 text-xs font-mono text-muted"
                >
                  {uploadStatus}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isLoading={isPending}
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
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    Slide Sequence ({orderedPhotoIds.length} frames)
                  </span>
                  <span className="text-xs text-muted">
                    Use arrows to reorder slides 1 →{" "}
                    {orderedPhotoIds.length || 1}
                  </span>
                </div>
                {orderedPhotoIds.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 rounded-md border border-line bg-soft/40 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {orderedPhotoIds.map((pId, idx) => {
                      const photo = allPhotos.find(
                        (p) => String(p.id) === String(pId),
                      );
                      if (!photo) return null;
                      const isCover = coverPhotoId === String(photo.id);
                      return (
                        <div
                          key={`ordered-${pId}`}
                          className={`relative flex flex-col rounded-md border p-2 transition-colors ${
                            isCover
                              ? "border-signal/70 bg-surface shadow-xs"
                              : "border-line bg-surface"
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-line">
                            <Image
                              src={photo.cloudinary_url}
                              alt={photo.title || "A Momented Photograph"}
                              fill
                              sizes="150px"
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
                                onClick={() => movePhoto(idx, -1)}
                                disabled={idx === 0}
                                aria-label="Move slide up"
                                className="rounded p-1 text-muted hover:bg-soft hover:text-ink disabled:opacity-30"
                              >
                                <ArrowUp size={13} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => movePhoto(idx, 1)}
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
                                onClick={() =>
                                  setCoverPhotoId(String(photo.id))
                                }
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
                                onClick={() =>
                                  removePhotoFromQueue(String(photo.id))
                                }
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
                    No slides selected yet. Pick photographs below to add them
                    to this series.
                  </div>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="library-picker">
                  Select Photographs From Library
                </FieldLabel>
                <div className="max-h-72 overflow-y-auto rounded-md border border-line bg-paper p-3">
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
                          onClick={() => togglePhotoSelection(String(photo.id))}
                          className={`flex flex-col rounded-md border p-2 text-left transition-all ${
                            isSelected
                              ? "border-signal/70 bg-soft shadow-xs"
                              : "border-line bg-surface hover:border-ink/20"
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-line">
                            <Image
                              src={photo.cloudinary_url}
                              alt={photo.title || "A Momented Photograph"}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                            {isSelected && (
                              <span className="absolute top-1 right-1 rounded-full bg-signal px-1.5 py-0.5 text-[10px] font-bold text-paper">
                                #{slideNumber}
                              </span>
                            )}
                          </div>
                          <span className="mt-1.5 truncate text-[11px] font-medium text-ink">
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
                  variant="ghost"
                  onClick={closeForm}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isLoading={isPending}
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
      <section aria-label="Existing series list">
        {series.length === 0 ? (
          <div className="rounded-lg border border-line bg-soft/40 p-12 text-center">
            <ImageIcon
              size={32}
              className="mx-auto mb-3 text-muted"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-ink">
              No series created yet
            </p>
            <p className="mt-1 text-xs text-muted">
              Create your first multi-photo series to display carousel slide
              stories.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <ul className="divide-y divide-line">
              {series.map((item) => {
                const coverPhoto =
                  item.photos.find((p) => p.id === item.cover_photo_id) ||
                  item.photos[0];
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-soft">
                        {coverPhoto ? (
                          <Image
                            src={coverPhoto.cloudinary_url}
                            alt={coverPhoto.title || "A Momented Photograph"}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                            No cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-medium text-ink">
                          {item.title}
                        </h4>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {item.photos.length}{" "}
                          {item.photos.length === 1 ? "slide" : "slides"}
                          {item.description ? ` · ${item.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditForm(item)}
                        disabled={isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="text-danger hover:bg-danger-soft hover:text-danger"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
