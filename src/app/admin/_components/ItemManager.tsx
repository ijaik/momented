"use client";
import {
  type ReactNode,
  type SubmitEvent,
  useState,
  useTransition,
} from "react";
import {
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
import Button from "@/components/ui/Button";
import PhotoChecklist, { type ChecklistPhoto } from "./PhotoChecklist";
import PhotoThumbnails from "./PhotoThumbnails";
export interface BaseItem {
  id: string | number;
  title: string;
  description?: string;
  content?: string;
  cover_photo_id?: string | number | null;
  photos?: ChecklistPhoto[];
  [key: string]: unknown;
}
interface ItemManagerProps<T extends BaseItem> {
  items: T[];
  allPhotos: ChecklistPhoto[];
  title: string;
  newItemLabel: string;
  titlePlaceholder: string;
  descName: string;
  descPlaceholder: string;
  descRows?: number;
  createAction: (formData: FormData) => Promise<{ success: boolean }>;
  editAction: (
    id: string | number,
    formData: FormData,
  ) => Promise<{ success: boolean }>;
  deleteAction: (id: string | number) => Promise<{ success: boolean }>;
  renderContent: (item: T) => ReactNode;
}
export default function ItemManager<T extends BaseItem>({
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
}: ItemManagerProps<T>) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isPending, startTransition] = useTransition();
  function handleCreate(event: SubmitEvent<HTMLFormElement>) {
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
  function handleEdit(
    event: SubmitEvent<HTMLFormElement>,
    id: string | number,
  ) {
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
        <Button type="button" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Close Form" : newItemLabel}
        </Button>
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
            {editingId === item.id ? (
              <form
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
                  defaultValue={item[descName] as string}
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="font-bold text-2xl text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                {renderContent(item)}
                <PhotoThumbnails
                  photos={item.photos}
                  fallbackTitle={item.title}
                  className="mt-6"
                />
                <div className="flex gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <Button variant="link" onClick={() => setEditingId(item.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => deleteAction(item.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
