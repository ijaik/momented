import Image from "next/image";
import { useState } from "react";
import {
  createCollectionAction,
  deleteCollectionAction,
  editCollectionAction,
} from "@/app/actions/admin";
import {
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
import PhotoChecklist from "./PhotoChecklist";
export default function CollectionManager({ collections, allPhotos }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingColId, setEditingColId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  async function handleCreate(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await createCollectionAction(
        new FormData(event.currentTarget),
      );
      if (result.success) {
        event.target.reset();
        setIsCreating(false);
      }
    } catch (_error) {
      alert("Failed to create collection.");
    } finally {
      setIsLoading(false);
    }
  }
  async function handleEdit(event, id) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await editCollectionAction(id, new FormData(event.currentTarget));
      setEditingColId(null);
    } catch (_error) {
      alert("Failed to update collection.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Your Collections
        </h2>
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-medium"
        >
          {isCreating ? "Close Form" : "+ New Collection"}
        </button>
      </div>
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5"
        >
          <FormInput
            type="text"
            name="title"
            required
            placeholder="Collection Title"
            className="text-lg font-semibold"
          />
          <FormTextarea
            name="description"
            rows="3"
            placeholder="Theme / Description"
          />
          <PhotoChecklist photos={allPhotos} />
          <SubmitButton
            isLoading={isLoading}
            loadingText="Saving..."
            text="Create Collection"
            className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
          />
        </form>
      )}
      <div className="flex flex-col gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            {editingColId === col.id ? (
              <form
                onSubmit={(e) => handleEdit(e, col.id)}
                className="flex flex-col gap-4"
              >
                <FormInput
                  type="text"
                  name="title"
                  defaultValue={col.title}
                  required
                  className="text-lg font-semibold"
                />
                <FormTextarea
                  name="description"
                  defaultValue={col.description}
                  rows="3"
                />
                <PhotoChecklist
                  photos={allPhotos}
                  linkedPhotos={col.photos}
                  initialCoverId={col.cover_photo_id}
                />
                <div className="flex gap-3 mt-4">
                  <SubmitButton
                    isLoading={isLoading}
                    loadingText="Saving..."
                    text="Save Collection"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingColId(null)}
                    className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="font-bold text-2xl text-zinc-900 dark:text-white">
                  {col.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                  {col.description}
                </p>
                {col.photos && col.photos.length > 0 && (
                  <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                    {col.photos.map((p) => (
                      <Image
                        key={p.id}
                        src={p.cloudinary_url}
                        alt={p.title}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-md shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      />
                    ))}
                  </div>
                )}
                <div className="flex gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingColId(col.id)}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                  >
                    Edit Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCollectionAction(col.id)}
                    className="text-sm font-semibold text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
