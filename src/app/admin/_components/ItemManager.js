import Image from "next/image";
import { useState, useTransition } from "react";
import {
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
import PhotoChecklist from "./PhotoChecklist";
export default function ItemManager({
  items,
  allPhotos,
  title,
  newItemLabel,
  titlePlaceholder,
  descName,
  descPlaceholder,
  descRows = 3,
  createAction,
  editAction,
  deleteAction,
  renderContent,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPending, startTransition] = useTransition();
  function handleCreate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      try {
        const result = await createAction(new FormData(form));
        if (result.success) {
          form.reset();
          setIsCreating(false);
        }
      } catch {
        alert(`Failed to create ${title.toLowerCase()}.`);
      }
    });
  }
  function handleEdit(event, id) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      try {
        await editAction(id, new FormData(form));
        setEditingId(null);
      } catch {
        alert(`Failed to update ${title.toLowerCase()}.`);
      }
    });
  }
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-lg font-medium"
        >
          {isCreating ? "Close Form" : newItemLabel}
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
            placeholder={titlePlaceholder}
            className="text-lg font-semibold"
          />
          <FormTextarea
            name={descName}
            required={descName === "content"}
            rows={descRows}
            placeholder={descPlaceholder}
          />
          <PhotoChecklist photos={allPhotos} />
          <SubmitButton
            isLoading={isPending}
            loadingText="Saving..."
            text="Create"
            className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
          />
        </form>
      )}
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            {editingId === item.id
              ? <form
                  onSubmit={(e) => handleEdit(e, item.id)}
                  className="flex flex-col gap-4"
                >
                  <FormInput
                    type="text"
                    name="title"
                    defaultValue={item.title}
                    required
                    className="text-lg font-semibold"
                  />
                  <FormTextarea
                    name={descName}
                    defaultValue={item[descName]}
                    required={descName === "content"}
                    rows={descRows}
                  />
                  <PhotoChecklist
                    photos={allPhotos}
                    linkedPhotos={item.photos}
                    initialCoverId={item.cover_photo_id}
                  />
                  <div className="flex gap-3 mt-4">
                    <SubmitButton
                      isLoading={isPending}
                      loadingText="Saving..."
                      text="Save"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              : <>
                  <h3 className="font-bold text-2xl text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  {renderContent(item)}
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                      {item.photos.map((p) => (
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
                      onClick={() => setEditingId(item.id)}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAction(item.id)}
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
