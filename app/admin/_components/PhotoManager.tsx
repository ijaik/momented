"use client";
import Image from "next/image";
import { type SubmitEvent, useState, useTransition } from "react";
import { deletePhotoAction, editPhotoAction } from "@/actions/photos";
import {
  getCloudinarySignatureAction,
  savePhotoToDbAction,
} from "@/actions/upload";
import {
  FieldLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "./AdminForms";
import Button from "@/components/ui/Button";
import { compressImageWithExif } from "@/lib/utils/imageCompression";
export interface PhotoItem {
  id: string | number;
  title: string;
  description?: string | null;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  collections?: { id: string | number; title: string }[];
  stories?: { id: string | number; title: string }[];
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
  stories: OptionItem[];
}
export default function PhotoManager({
  photos,
  collections,
  rules,
  stories,
}: PhotoManagerProps) {
  const [status, setStatus] = useState("");
  const [editingPhotoId, setEditingPhotoId] = useState<string | number | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  async function handleUpload(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Preparing upload…");
    const form = event.currentTarget;
    const formDataNative = new FormData(form);
    startTransition(async () => {
      try {
        const fileInput = form.elements.namedItem("photo") as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) throw new Error("Please select a photo to upload.");
        const fileToUpload = await compressImageWithExif(file, setStatus);
        const signData = await getCloudinarySignatureAction();
        setStatus("Uploading…");
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("api_key", signData.apiKey);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);
        formData.append("image_metadata", "true");
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          { method: "POST", body: formData },
        );
        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
        const uploadData = await uploadRes.json();
        setStatus("Saving photo data…");
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
          storyIds: formDataNative.getAll("story_ids").map(String),
          secure_url: uploadData.secure_url,
          public_id: uploadData.public_id,
          width: uploadData.width,
          height: uploadData.height,
          image_metadata: uploadData.image_metadata,
        });
        setStatus("Uploaded successfully.");
        form.reset();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Upload failed: ${message}`);
      } finally {
        setTimeout(() => setStatus(""), 4000);
      }
    });
  }
  function saveEdit(event: SubmitEvent<HTMLFormElement>, id: string | number) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await editPhotoAction(
          id,
          formData.get("title") as string,
          formData.get("description") as string,
          formData.getAll("collection_ids").map(String),
          formData.getAll("story_ids").map(String),
          formData.getAll("rule_ids").map(String),
        );
        setEditingPhotoId(null);
      } catch {
        alert("Failed to save changes.");
      }
    });
  }
  const isBusy = isPending || Boolean(status);
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div>
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6 lg:sticky lg:top-8"
        >
          <div>
            <h2 className="text-lg font-medium text-ink">Add a photograph</h2>
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
            <FieldLabel htmlFor="photo-collections">Collections</FieldLabel>
            <FormSelect
              id="photo-collections"
              name="collection_ids"
              multiple
              size={3}
              className="h-auto min-h-20"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FieldLabel htmlFor="photo-rules">Rules</FieldLabel>
            <FormSelect
              id="photo-rules"
              name="rule_ids"
              multiple
              size={3}
              className="h-auto min-h-20"
            >
              {rules?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FieldLabel htmlFor="photo-stories">Stories</FieldLabel>
            <FormSelect
              id="photo-stories"
              name="story_ids"
              multiple
              size={3}
              className="h-auto min-h-20"
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </FormSelect>
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
              className="w-full cursor-pointer rounded-md border border-dashed border-line bg-paper px-3 py-4 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:border-ink/30"
            />
          </div>
          <SubmitButton
            isLoading={isBusy}
            loadingText={status || "Uploading…"}
            text="Upload photograph"
          />
        </form>
      </div>
      <div className="flex min-w-0 flex-col divide-y divide-line">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="flex flex-col gap-5 py-7 sm:flex-row sm:gap-6"
          >
            <Image
              src={photo.cloudinary_url}
              alt={photo.title}
              width={200}
              height={200}
              className="h-32 w-full shrink-0 rounded-sm border border-line object-cover bg-soft sm:w-32"
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
            <div className="min-w-0 flex-1">
              {editingPhotoId === photo.id ? (
                <form
                  onSubmit={(e) => saveEdit(e, photo.id)}
                  className="flex flex-col gap-4"
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
                      <FieldLabel htmlFor={`edit-photo-cols-${photo.id}`}>
                        Collections
                      </FieldLabel>
                      <FormSelect
                        id={`edit-photo-cols-${photo.id}`}
                        name="collection_ids"
                        multiple
                        size={4}
                        defaultValue={
                          photo.collections?.map((c) => String(c.id)) || []
                        }
                        className="h-auto min-h-28"
                      >
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div>
                      <FieldLabel htmlFor={`edit-photo-stories-${photo.id}`}>
                        Stories
                      </FieldLabel>
                      <FormSelect
                        id={`edit-photo-stories-${photo.id}`}
                        name="story_ids"
                        multiple
                        size={4}
                        defaultValue={
                          photo.stories?.map((s) => String(s.id)) || []
                        }
                        className="h-auto min-h-28"
                      >
                        {stories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SubmitButton
                      isLoading={isPending}
                      text="Save changes"
                      loadingText="Saving…"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPhotoId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="font-serif text-xl font-medium leading-snug tracking-tight text-ink">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="mt-1 text-[15px] text-muted line-clamp-2">
                      {photo.description}
                    </p>
                  )}
                  <div className="mt-3 flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPhotoId(photo.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        deletePhotoAction(photo.id, photo.cloudinary_public_id)
                      }
                    >
                      Delete
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