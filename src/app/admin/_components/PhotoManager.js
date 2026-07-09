import Image from "next/image";
import { useState } from "react";
import { deletePhotoAction, editPhotoAction } from "@/app/actions/admin";
import {
  getCloudinarySignatureAction,
  savePhotoToDbAction,
} from "@/app/actions/upload";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
export default function PhotoManager({
  photos,
  collections,
  stories,
  reloadData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    collection_id: "",
    story_id: "",
  });
  async function handleUpload(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Preparing upload...");
    try {
      const form = event.currentTarget;
      const file = form.elements.photo.files[0];
      if (!file) throw new Error("Please select a photo to upload.");
      if (file.size > 15 * 1024 * 1024)
        throw new Error("File is too large. Maximum size is 15MB.");
      const signData = await getCloudinarySignatureAction();
      setStatus("Uploading to Cloudinary...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);
      formData.append("image_metadata", "true");
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!uploadRes.ok) throw new Error("Failed to upload to Cloudinary");
      const uploadData = await uploadRes.json();
      setStatus("Saving photo data...");
      await savePhotoToDbAction({
        title: form.elements.title.value,
        description: form.elements.description.value,
        artistInput: form.elements.artist.value,
        collectionId: form.elements.collection_id.value,
        storyId: form.elements.story_id.value,
        secure_url: uploadData.secure_url,
        public_id: uploadData.public_id,
        width: uploadData.width,
        height: uploadData.height,
        image_metadata: uploadData.image_metadata,
      });
      setStatus("Photo Uploaded Successfully!");
      form.reset();
      await reloadData();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  }
  function startEdit(photo) {
    setEditingPhotoId(photo.id);
    setEditForm({
      title: photo.title,
      description: photo.description || "",
      collection_id: photo.collection_id || "",
      story_id: photo.story_id || "",
    });
  }
  async function saveEdit(id) {
    try {
      await editPhotoAction(
        id,
        editForm.title,
        editForm.description,
        editForm.collection_id,
        editForm.story_id,
      );
      setEditingPhotoId(null);
      await reloadData();
    } catch (_error) {
      alert("Failed to save photo changes.");
    }
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
            <FormSelect name="collection_id">
              <option value="">-- No Collection --</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </FormSelect>
            <FormSelect name="story_id">
              <option value="">-- No Story --</option>
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </FormSelect>
            <FormTextarea
              name="description"
              rows="3"
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
              isLoading={isLoading}
              loadingText="Uploading..."
              text="Upload Photo"
              className="bg-black dark:bg-white text-white dark:text-black w-full"
            />
          </form>
          {status && (
            <div className="mt-4 p-3 text-center border rounded-lg text-sm font-medium">
              {status}
            </div>
          )}
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
              {editingPhotoId === photo.id
                ? <div className="flex flex-col gap-2">
                    <FormInput
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <FormTextarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows="2"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <FormSelect
                        value={editForm.collection_id}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            collection_id: e.target.value,
                          })
                        }
                        className="w-full sm:w-1/2"
                      >
                        <option value="">-- No Collection --</option>
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </FormSelect>
                      <FormSelect
                        value={editForm.story_id}
                        onChange={(e) =>
                          setEditForm({ ...editForm, story_id: e.target.value })
                        }
                        className="w-full sm:w-1/2"
                      >
                        <option value="">-- No Story --</option>
                        {stories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(photo.id)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPhotoId(null)}
                        className="bg-zinc-200 dark:bg-zinc-800 px-4 py-1.5 rounded text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                : <div>
                    <h3 className="font-bold text-lg">{photo.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                      {photo.description}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(photo)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deletePhotoAction(
                            photo.id,
                            photo.cloudinary_public_id,
                          ).then(reloadData)
                        }
                        className="text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
