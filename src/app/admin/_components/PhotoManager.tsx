"use client";
import Image from "next/image";
import { type SubmitEvent, useState, useTransition } from "react";
import { deletePhotoAction, editPhotoAction } from "@/actions/admin";
import {
  getCloudinarySignatureAction,
  savePhotoToDbAction,
} from "@/actions/upload";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
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
    setStatus("Preparing upload...");
    const form = event.currentTarget;
    const formDataNative = new FormData(form);
    startTransition(async () => {
      try {
        const fileInput = form.elements.namedItem("photo") as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) throw new Error("Please select a photo to upload.");
        const fileToUpload = await compressImageWithExif(file, setStatus);
        const signData = await getCloudinarySignatureAction();
        setStatus("Uploading to Cloudinary...");
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
        setStatus("Saving photo data...");
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
        setStatus("Photo Uploaded Successfully!");
        form.reset();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Error: ${message}`);
      } finally {
        setTimeout(() => setStatus(""), 3000);
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 sticky top-10">
          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Upload Photo
            </h1>
            <FormInput name="title" required placeholder="Photo Title" />
            <FormInput
              name="artist"
              defaultValue="Jai"
              placeholder="Photographer Name"
            />
            <FormSelect
              name="collection_ids"
              multiple
              size={3}
              className="h-24"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </FormSelect>
            <FormSelect name="rule_ids" multiple size={3} className="h-24">
              {rules?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </FormSelect>
            <FormSelect name="story_ids" multiple size={3} className="h-24">
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </FormSelect>
            <FormTextarea
              name="description"
              rows={3}
              placeholder="Photo Caption (Optional)"
            />
            <input
              type="file"
              name="photo"
              accept="image/*"
              required
              className="text-sm cursor-pointer border border-zinc-300 dark:border-zinc-700 p-2 rounded-lg"
            />
            <SubmitButton
              isLoading={isPending || Boolean(status)}
              loadingText={status || "Uploading..."}
              text="Upload Photo"
              className="bg-black dark:bg-white text-white dark:text-black w-full"
            />
          </form>
        </div>
      </div>
      <div className="lg:col-span-2 flex flex-col gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-6"
          >
            <Image
              src={photo.cloudinary_url}
              alt={photo.title}
              width={200}
              height={200}
              className="w-full sm:w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1 w-full">
              {editingPhotoId === photo.id ? (
                <form
                  onSubmit={(e) => saveEdit(e, photo.id)}
                  className="flex flex-col gap-2"
                >
                  <FormInput name="title" defaultValue={photo.title} required />
                  <FormTextarea
                    name="description"
                    defaultValue={photo.description ?? ""}
                    rows={2}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <FormSelect
                      name="collection_ids"
                      multiple
                      size={4}
                      defaultValue={
                        photo.collections?.map((c) => String(c.id)) || []
                      }
                      className="w-full sm:w-1/2 h-28"
                    >
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </FormSelect>
                    <FormSelect
                      name="story_ids"
                      multiple
                      size={4}
                      defaultValue={
                        photo.stories?.map((s) => String(s.id)) || []
                      }
                      className="w-full sm:w-1/2 h-28"
                    >
                      {stories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <SubmitButton
                      isLoading={isPending}
                      text="Save"
                      loadingText="Saving..."
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingPhotoId(null)}
                      className="bg-zinc-200 dark:bg-zinc-800 px-4 py-1.5 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="font-bold text-lg">{photo.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                    {photo.description}
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setEditingPhotoId(photo.id)}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() =>
                        deletePhotoAction(photo.id, photo.cloudinary_public_id)
                      }
                      className="text-sm text-red-600 dark:text-red-400"
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
