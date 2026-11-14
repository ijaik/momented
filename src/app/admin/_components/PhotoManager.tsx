"use client";
import { Download, Share2 } from "lucide-react";
import Image from "next/image";
import {
  type SubmitEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { deletePhotoAction, editPhotoAction } from "@/actions/photos";
import { savePhotoToDbAction } from "@/actions/upload";
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
export interface PhotoItem {
  id: string | number;
  title: string;
  description?: string | null;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  downloads?: number;
  shares?: number;
  collections?: { id: string | number; title: string }[];
  rules?: { id: string | number; title: string }[];
}
interface OptionItem {
  id: string | number;
  title: string;
}
interface PhotoManagerProps {
  photos: PhotoItem[];
  collections: OptionItem[];
  rules: OptionItem[];
}
type UploadState =
  | { phase: "idle" }
  | { phase: "active"; step: string }
  | { phase: "success"; message: string }
  | { phase: "error"; message: string };
export default function PhotoManager({
  photos,
  collections,
  rules,
}: PhotoManagerProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    phase: "idle",
  });
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStatusTimer = () => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
  };
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);
  const [editingPhotoId, setEditingPhotoId] = useState<string | number | null>(
    null,
  );
  const [deletingPhotoId, setDeletingPhotoId] = useState<
    string | number | null
  >(null);
  const [isUploadPending, startUploadTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  async function handleDeletePhoto(id: string | number, publicId?: string) {
    const confirmed = await confirmAction({
      title: "Delete Photograph",
      message:
        "Are you sure you want to permanently delete this photograph? This will remove the image file and all its curatorial associations.",
      confirmLabel: "Delete",
      isDestructive: true,
    });
    if (!confirmed) return;
    setDeletingPhotoId(id);
    startDeleteTransition(async () => {
      try {
        await deletePhotoAction(id, publicId);
        notifySuccess("Photograph permanently deleted.");
      } catch {
        notifyError("Failed to delete photograph.");
      } finally {
        setDeletingPhotoId(null);
      }
    });
  }
  async function handleUpload(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    clearStatusTimer();
    setUploadState({ phase: "active", step: "Preparing upload…" });
    const form = event.currentTarget;
    const formDataNative = new FormData(form);
    startUploadTransition(async () => {
      try {
        const fileInput = form.elements.namedItem("photo") as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) throw new Error("Please select a photo to upload.");
        const uploadData = await uploadPhotoToCloudinary(file, {
          onStatusChange: (step) => setUploadState({ phase: "active", step }),
        });
        setUploadState({ phase: "active", step: "Saving photo data…" });
        const titleInput = form.elements.namedItem("title") as HTMLInputElement;
        const descriptionInput = form.elements.namedItem(
          "description",
        ) as HTMLTextAreaElement;
        const artistInput = form.elements.namedItem(
          "artist",
        ) as HTMLInputElement;
        await savePhotoToDbAction({
          title: titleInput.value,
          description: descriptionInput.value,
          artistInput: artistInput.value,
          collectionIds: formDataNative.getAll("collection_ids").map(String),
          ruleIds: formDataNative.getAll("rule_ids").map(String),
          secure_url: uploadData.secure_url,
          public_id: uploadData.public_id,
          width: uploadData.width,
          height: uploadData.height,
          image_metadata: uploadData.image_metadata,
        });
        setUploadState({
          phase: "success",
          message: "Uploaded successfully.",
        });
        notifySuccess("Photograph uploaded successfully.");
        form.reset();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setUploadState({
          phase: "error",
          message: `Upload failed: ${message}`,
        });
        notifyError(`Upload failed: ${message}`);
      } finally {
        clearStatusTimer();
        statusTimeoutRef.current = setTimeout(
          () => setUploadState({ phase: "idle" }),
          4000,
        );
      }
    });
  }
  function saveEdit(event: SubmitEvent<HTMLFormElement>, id: string | number) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startSaveTransition(async () => {
      try {
        await editPhotoAction(
          id,
          formData.get("title") as string,
          formData.get("description") as string,
          formData.getAll("collection_ids").map(String),
          formData.getAll("rule_ids").map(String),
        );
        setEditingPhotoId(null);
        notifySuccess("Changes saved successfully.");
      } catch {
        notifyError("Failed to save changes.");
      }
    });
  }
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div>
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-5 rounded-2xl border border-line/70 bg-surface/75 p-6 shadow-xs backdrop-blur-md lg:sticky lg:top-8"
        >
          <div>
            <h2 className="font-serif text-lg tracking-tight text-ink">
              Add a photograph
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Exif data is read automatically.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="photo-title">Title</FieldLabel>
            <FormInput
              id="photo-title"
              name="title"
              required
              placeholder="Give this moment a name"
            />
          </div>
          <div>
            <FieldLabel htmlFor="photo-artist">Photographer</FieldLabel>
            <FormInput
              id="photo-artist"
              name="artist"
              defaultValue="Jai"
              placeholder="Photographer name"
            />
          </div>
          <div>
            <FieldLabel as="span">Collections</FieldLabel>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {collections.map((c) => (
                <label
                  key={c.id}
                  className="group inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:bg-soft hover:text-ink has-checked:bg-solid has-checked:text-on-solid has-checked:border-solid transition-colors"
                >
                  <input
                    type="checkbox"
                    name="collection_ids"
                    value={c.id}
                    className="sr-only"
                  />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel as="span">Rules</FieldLabel>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rules?.map((r) => (
                <label
                  key={r.id}
                  className="group inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:bg-soft hover:text-ink has-checked:bg-solid has-checked:text-on-solid has-checked:border-solid transition-colors"
                >
                  <input
                    type="checkbox"
                    name="rule_ids"
                    value={r.id}
                    className="sr-only"
                  />
                  <span>{r.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="photo-caption">Caption</FieldLabel>
            <FormTextarea
              id="photo-caption"
              name="description"
              rows={3}
              placeholder="A line about this frame (optional)"
            />
          </div>
          <div>
            <FieldLabel htmlFor="photo-file">Image file</FieldLabel>
            <input
              id="photo-file"
              type="file"
              name="photo"
              accept="image/*"
              required
              className="w-full cursor-pointer rounded-xl border border-dashed border-line/80 bg-paper/60 px-4 py-4 text-sm text-muted transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:border-ink/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <SubmitButton
              isLoading={isUploadPending}
              loadingText="Uploading…"
              text="Upload photograph"
            />
            {uploadState.phase !== "idle" && (
              <output
                aria-live="polite"
                className={`text-xs ${
                  uploadState.phase === "error" ? "text-signal" : "text-muted"
                }`}
              >
                {uploadState.phase === "active"
                  ? uploadState.step
                  : uploadState.message}
              </output>
            )}
          </div>
        </form>
      </div>
      <div className="flex min-w-0 flex-col divide-y divide-line">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex flex-col gap-5 py-7 sm:flex-row sm:gap-6"
          >
            <Image
              src={photo.cloudinary_url}
              alt={photo.title || "A Momented Photograph"}
              width={200}
              height={200}
              sizes="(max-width: 640px) 100vw, 128px"
              className="h-32 w-full shrink-0 rounded-xl border border-line/70 object-cover bg-soft sm:w-32"
            />
            <div className="min-w-0 flex-1">
              {editingPhotoId === photo.id ? (
                <form
                  onSubmit={(e) => saveEdit(e, photo.id)}
                  className="flex flex-col gap-4 rounded-2xl border border-line/70 bg-surface/75 p-5 shadow-xs backdrop-blur-md"
                >
                  <div>
                    <FieldLabel htmlFor={`edit-photo-title-${photo.id}`}>
                      Title
                    </FieldLabel>
                    <FormInput
                      id={`edit-photo-title-${photo.id}`}
                      name="title"
                      defaultValue={photo.title}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`edit-photo-desc-${photo.id}`}>
                      Caption
                    </FieldLabel>
                    <FormTextarea
                      id={`edit-photo-desc-${photo.id}`}
                      name="description"
                      defaultValue={photo.description ?? ""}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel as="span">Collections</FieldLabel>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {collections.map((c) => {
                          const isChecked = photo.collections?.some(
                            (pc) => String(pc.id) === String(c.id),
                          );
                          return (
                            <label
                              key={c.id}
                              className="group inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:bg-soft hover:text-ink has-checked:bg-solid has-checked:text-on-solid has-checked:border-solid transition-colors"
                            >
                              <input
                                type="checkbox"
                                name="collection_ids"
                                value={c.id}
                                defaultChecked={isChecked}
                                className="sr-only"
                              />
                              <span>{c.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <FieldLabel as="span">Rules</FieldLabel>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rules?.map((r) => {
                          const isChecked = photo.rules?.some(
                            (pr) => String(pr.id) === String(r.id),
                          );
                          return (
                            <label
                              key={r.id}
                              className="group inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:bg-soft hover:text-ink has-checked:bg-solid has-checked:text-on-solid has-checked:border-solid transition-colors"
                            >
                              <input
                                type="checkbox"
                                name="rule_ids"
                                value={r.id}
                                defaultChecked={isChecked}
                                className="sr-only"
                              />
                              <span>{r.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SubmitButton
                      isLoading={isSavePending}
                      text="Save changes"
                      loadingText="Saving…"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isSavePending}
                      onClick={() => setEditingPhotoId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl leading-snug tracking-tight text-ink">
                      {photo.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted font-mono">
                      <span
                        title="Downloads"
                        className="inline-flex items-center gap-1"
                      >
                        <Download size={11} aria-hidden="true" />
                        {photo.downloads ?? 0}
                      </span>
                      <span
                        title="Shares"
                        className="inline-flex items-center gap-1"
                      >
                        <Share2 size={11} aria-hidden="true" />
                        {photo.shares ?? 0}
                      </span>
                    </div>
                  </div>
                  {photo.description && (
                    <p className="mt-1 text-[15px] text-muted line-clamp-2">
                      {photo.description}
                    </p>
                  )}
                  <div className="mt-3 flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingPhotoId(photo.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={deletingPhotoId === photo.id || isDeletePending}
                      onClick={() =>
                        handleDeletePhoto(photo.id, photo.cloudinary_public_id)
                      }
                    >
                      {deletingPhotoId === photo.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
