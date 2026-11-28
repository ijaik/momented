"use client";
import {
  type ReactNode,
  type SubmitEvent,
  useId,
  useState,
  useTransition,
} from "react";
import Button from "@/components/ui/Button";
import {
  confirmAction,
  notifyError,
  notifySuccess,
} from "@/components/ui/notifications";
import type { BaseItem, ChecklistPhoto } from "@/types/admin";
import {
  FieldLabel,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "./AdminForms";
import PhotoChecklist from "./PhotoChecklist";
import PhotoThumbnails from "./PhotoThumbnails";

export type { BaseItem };

interface ItemManagerProps<
  TId extends string | number = string,
  T extends BaseItem<TId> = BaseItem<TId>,
> {
  items: T[];
  allPhotos: ChecklistPhoto[];
  title: string;
  subtitle?: string;
  newItemLabel?: string;
  editButtonLabel?: string;
  titlePlaceholder?: string;
  descPlaceholder?: string;
  createAction?: (formData: FormData) => Promise<{ success: boolean }>;
  editAction: (id: TId, formData: FormData) => Promise<{ success: boolean }>;
  deleteAction?: (id: TId) => Promise<{ success: boolean }>;
  renderContent: (item: T) => ReactNode;
}
type EditorMode<TId> =
  | { type: "idle" }
  | { type: "creating" }
  | { type: "editing"; id: TId };
type PendingOp<TId> =
  | { type: "none" }
  | { type: "creating" }
  | { type: "editing"; id: TId }
  | { type: "deleting"; id: TId };
function EntityForm({
  allPhotos,
  item,
  titlePlaceholder,
  descPlaceholder,
  submitText,
  isLoading,
  onSubmit,
  onCancel,
}: {
  allPhotos: ChecklistPhoto[];
  item?: BaseItem<string | number>;
  titlePlaceholder?: string;
  descPlaceholder?: string;
  submitText: string;
  isLoading: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const formId = useId();
  const titleId = `${formId}-title`;
  const descId = `${formId}-desc`;
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-line/70 bg-surface/75 p-6 shadow-xs backdrop-blur-md sm:p-7"
    >
      <div>
        <FieldLabel htmlFor={titleId}>Title</FieldLabel>
        <FormInput
          id={titleId}
          type="text"
          name="title"
          defaultValue={item?.title ?? ""}
          required
          placeholder={titlePlaceholder}
        />
      </div>
      <div>
        <FieldLabel htmlFor={descId}>Description</FieldLabel>
        <FormTextarea
          id={descId}
          name="description"
          defaultValue={item?.description ?? ""}
          rows={3}
          placeholder={descPlaceholder}
        />
      </div>
      <PhotoChecklist
        key={item ? String(item.id) : "new"}
        photos={allPhotos}
        linkedPhotos={item?.photos}
        initialCoverId={item?.cover_photo_id}
      />
      <div className="flex items-center gap-3">
        <SubmitButton
          isLoading={isLoading}
          loadingText="Saving…"
          text={submitText}
        />
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
export default function ItemManager<
  TId extends string | number = string,
  T extends BaseItem<TId> = BaseItem<TId>,
>({
  items,
  allPhotos,
  title,
  subtitle,
  newItemLabel = "New item",
  editButtonLabel = "Edit",
  titlePlaceholder = "Title",
  descPlaceholder = "",
  createAction,
  editAction,
  deleteAction,
  renderContent,
}: ItemManagerProps<TId, T>) {
  const [mode, setMode] = useState<EditorMode<TId>>({ type: "idle" });
  const [pendingOp, setPendingOp] = useState<PendingOp<TId>>({ type: "none" });
  const [isPending, startTransition] = useTransition();
  const isCreating = mode.type === "creating";
  const editingId = mode.type === "editing" ? mode.id : null;
  async function handleDelete(id: TId) {
    if (!deleteAction) return;
    const confirmed = await confirmAction({
      title: `Delete ${title}`,
      message: `Are you sure you want to permanently delete this ${title.toLowerCase()}?`,
      confirmLabel: "Delete",
      isDestructive: true,
    });
    if (!confirmed) return;
    setPendingOp({ type: "deleting", id });
    startTransition(async () => {
      try {
        await deleteAction(id);
        notifySuccess(`${title} deleted.`);
      } catch {
        notifyError(`Failed to delete ${title.toLowerCase()}.`);
      } finally {
        setPendingOp({ type: "none" });
      }
    });
  }
  function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createAction) return;
    const form = event.currentTarget;
    setPendingOp({ type: "creating" });
    startTransition(async () => {
      try {
        const result = await createAction(new FormData(form));
        if (result.success) {
          form.reset();
          setMode({ type: "idle" });
          notifySuccess(`${title} created.`);
        }
      } catch {
        notifyError(`Failed to create ${title.toLowerCase()}.`);
      } finally {
        setPendingOp({ type: "none" });
      }
    });
  }
  function handleEdit(event: SubmitEvent<HTMLFormElement>, id: TId) {
    event.preventDefault();
    const form = event.currentTarget;
    setPendingOp({ type: "editing", id });
    startTransition(async () => {
      try {
        await editAction(id, new FormData(form));
        setMode({ type: "idle" });
        notifySuccess(`${title} updated.`);
      } catch {
        notifyError(`Failed to update ${title.toLowerCase()}.`);
      } finally {
        setPendingOp({ type: "none" });
      }
    });
  }
  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {subtitle ||
              `${items.length} ${items.length === 1 ? "entry" : "entries"}`}
          </p>
        </div>
        {createAction && (
          <Button
            type="button"
            size="sm"
            variant={isCreating ? "secondary" : "primary"}
            onClick={() =>
              setMode((prev) =>
                prev.type === "creating"
                  ? { type: "idle" }
                  : { type: "creating" },
              )
            }
          >
            {isCreating ? "Cancel" : newItemLabel}
          </Button>
        )}
      </div>
      {createAction && isCreating && (
        <EntityForm
          allPhotos={allPhotos}
          titlePlaceholder={titlePlaceholder}
          descPlaceholder={descPlaceholder}
          submitText="Create"
          isLoading={isPending && pendingOp.type === "creating"}
          onSubmit={handleCreate}
          onCancel={() => setMode({ type: "idle" })}
        />
      )}
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-line py-8 first:border-t"
          >
            {editingId === item.id ? (
              <EntityForm
                allPhotos={allPhotos}
                item={item}
                submitText="Save changes"
                isLoading={
                  isPending &&
                  pendingOp.type === "editing" &&
                  pendingOp.id === item.id
                }
                onSubmit={(e) => handleEdit(e, item.id)}
                onCancel={() => setMode({ type: "idle" })}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-serif text-2xl leading-snug tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setMode({ type: "editing", id: item.id })}
                    >
                      {editButtonLabel}
                    </Button>
                    {deleteAction && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleDelete(item.id)}
                      >
                        {pendingOp.type === "deleting" &&
                        pendingOp.id === item.id
                          ? "Deleting…"
                          : "Delete"}
                      </Button>
                    )}
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
