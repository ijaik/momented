import Image from "next/image";
import { useState } from "react";
import {
  createCollectionAction,
  deleteCollectionAction,
  editCollectionAction,
} from "@/app/actions/admin";
import PhotoChecklist from "./PhotoChecklist";
export default function CollectionManager({
  collections,
  allPhotos,
  reloadData,
}) {
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
        await reloadData();
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
      await reloadData();
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
          <input
            type="text"
            name="title"
            required
            placeholder="Collection Title"
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white text-lg font-semibold"
          />
          <textarea
            name="description"
            rows="3"
            placeholder="Theme / Description"
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white"
          />
          <PhotoChecklist photos={allPhotos} />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 mt-2 transition-colors"
          >
            {isLoading ? "Saving..." : "Create Collection"}
          </button>
        </form>
      )}
      <div className="flex flex-col gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            {editingColId === col.id
              ? <form
                  onSubmit={(e) => handleEdit(e, col.id)}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    name="title"
                    defaultValue={col.title}
                    required
                    className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white text-lg font-semibold"
                  />
                  <textarea
                    name="description"
                    defaultValue={col.description}
                    rows="3"
                    className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white"
                  />
                  <PhotoChecklist
                    photos={allPhotos}
                    linkedPhotos={col.photos}
                    initialCoverId={col.cover_photo_id}
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      Save Collection
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingColId(null)}
                      className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              : <>
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
                      onClick={() =>
                        deleteCollectionAction(col.id).then(reloadData)
                      }
                      className="text-sm font-semibold text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </>}
          </div>
        ))}
      </div>
    </div>
  );
}
