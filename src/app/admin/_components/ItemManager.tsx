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
  description?: string | null;
  content?: string | null;
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
  descLabel: string;
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
function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-ink"
    >
      {children}
    </label>
  );
}
export default function ItemManager<T extends BaseItem>({
  items,
  allPhotos,
  title,
  newItemLabel,
  titlePlaceholder,
  descName,
  descLabel,
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
    <div className="flex w-full flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">
            {items.length} {items.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isCreating ? "secondary" : "primary"}
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : newItemLabel}
        </Button>
      </div>
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6"
        >
          <div>
            <FieldLabel htmlFor="new-title">Title</FieldLabel>
            <FormInput
              id="new-title"
              type="text"
              name="title"
              required
              placeholder={titlePlaceholder}
            />
          </div>
          <div>
            <FieldLabel htmlFor="new-desc">{descLabel}</FieldLabel>
            <FormTextarea
              id="new-desc"
              name={descName}
              required={descName === "content"}
              rows={descRows}
              placeholder={descPlaceholder}
            />
          </div>
          <PhotoChecklist photos={allPhotos} />
          <div className="flex items-center gap-3">
            <SubmitButton
              isLoading={isPending}
              loadingText="Saving…"
              text="Create"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-line py-8 first:border-t"
          >
            {editingId === item.id ? (
              <form
                onSubmit={(e) => handleEdit(e, item.id)}
                className="flex flex-col gap-5"
              >
                <div>
                  <FieldLabel htmlFor={`edit-title-${item.id}`}>
                    Title
                  </FieldLabel>
                  <FormInput
                    id={`edit-title-${item.id}`}
                    type="text"
                    name="title"
                    defaultValue={item.title}
                    required
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`edit-desc-${item.id}`}>
                    {descLabel}
                  </FieldLabel>
                  <FormTextarea
                    id={`edit-desc-${item.id}`}
                    name={descName}
                    defaultValue={item[descName] as string}
                    required={descName === "content"}
                    rows={descRows}
                  />
                </div>
                <PhotoChecklist
                  photos={allPhotos}
                  linkedPhotos={item.photos}
                  initialCoverId={item.cover_photo_id}
                />
                <div className="flex items-center gap-3">
                  <SubmitButton
                    isLoading={isPending}
                    loadingText="Saving…"
                    text="Save changes"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-serif text-2xl font-medium leading-snug tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(item.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => deleteAction(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {renderContent(item)}
                <PhotoThumbnails
                  photos={item.photos}
                  fallbackTitle={item.title}
                  className="mt-5"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
