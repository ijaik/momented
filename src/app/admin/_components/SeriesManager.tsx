"use client";
import { Plus, Upload } from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type SubmitEvent,
  useEffect,
  useRef,
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
  const queuedFilesRef = useRef<QueuedSlideFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    queuedFilesRef.current = queuedFiles;
  }, [queuedFiles]);
  useEffect(() => {
    return () => {
      revokePreviews(queuedFilesRef.current);
    };
  }, []);
  const clearQueuedFiles = () => {
    revokePreviews(queuedFiles);
    setQueuedFiles([]);
  };
  const openCreateForm = (mode: "library" | "upload" = "library") => {
    setEditingSeries(null);
    setCreationMode(mode);
    setOrderedPhotoIds([]);
    setCoverPhotoId(null);
    clearQueuedFiles();
    setUploadStatus("");
    setIsCreating(true);
  };
  const openEditForm = (item: SeriesAdminItem) => {
    setIsCreating(false);
    setEditingSeries(item);
    setOrderedPhotoIds(item.photos.map((p) => String(p.id)));
    setCoverPhotoId(item.cover_photo_id || item.photos[0]?.id || null);
    clearQueuedFiles();
    setUploadStatus("");
  };
  const closeForm = () => {
    setIsCreating(false);
    setEditingSeries(null);
    setOrderedPhotoIds([]);
    setCoverPhotoId(null);
    clearQueuedFiles();
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
    setQueuedFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview.startsWith("blob:"))
        URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
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
      const uploadedPhotos: { id: string; publicId: string; index: number }[] =
        [];
      try {
        const total = queuedFiles.length;
        setUploadStatus(`Preparing ${total} slides for upload…`);
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
                  setUploadStatus(`Slide ${i + 1}/${total}: ${s}`),
              });
              setUploadStatus(`Saving slide ${i + 1} of ${total} to database…`);
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
                  : creationMode === "upload"
                    ? "Upload multiple photographs in exact slide order"
                    : "Select and order existing photographs from your library"}
              </p>
            </div>
            {!editingSeries && (
              <div className="inline-flex rounded-full border border-line/70 bg-soft/60 p-1 text-xs backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setCreationMode("library")}
                  className={`rounded-full px-3.5 py-1 font-medium transition-all duration-150 active:scale-95 ${
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
                  className={`rounded-full px-3.5 py-1 font-medium transition-all duration-150 active:scale-95 ${
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
                onClear={clearQueuedFiles}
                onMove={moveQueuedFile}
                onRemove={removeQueuedFile}
                onUpdateTitle={updateQueuedSlideTitle}
                onUpdateDescription={updateQueuedSlideDescription}
              />
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
                  variant="secondary"
                  size="sm"
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
              <SeriesSlideList
                orderedPhotoIds={orderedPhotoIds}
                allPhotos={allPhotos}
                coverPhotoId={coverPhotoId}
                onMovePhoto={movePhoto}
                onSetCoverPhoto={setCoverPhotoId}
                onRemovePhoto={removePhotoFromQueue}
              />
              <div>
                <FieldLabel htmlFor="library-picker">
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
                          onClick={() => togglePhotoSelection(String(photo.id))}
                          className={`flex flex-col rounded-xl border p-2 text-left transition-all duration-150 active:scale-95 ${
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
      <SeriesCardList
        series={series}
        isPending={isPending}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />
    </div>
  );
}
