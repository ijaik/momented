"use client";
import { type SubmitEvent, useState, useTransition } from "react";
import { editCalendarCollectionAction } from "@/actions/admin";
import {
  FieldLabel,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
import Button from "@/components/ui/Button";
import PhotoChecklist, { type ChecklistPhoto } from "./PhotoChecklist";
import PhotoThumbnails from "./PhotoThumbnails";
export interface CalendarItem {
  id: string | number;
  title: string;
  description?: string | null;
  cover_photo_id?: string | number | null;
  photos?: ChecklistPhoto[];
}
interface CalendarManagerProps {
  calendars: CalendarItem[];
  allPhotos: ChecklistPhoto[];
}
export default function CalendarManager({
  calendars,
  allPhotos,
}: CalendarManagerProps) {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isPending, startTransition] = useTransition();
  function handleEdit(
    event: SubmitEvent<HTMLFormElement>,
    id: string | number,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    startTransition(async () => {
      try {
        await editCalendarCollectionAction(id, new FormData(form));
        setEditingId(null);
      } catch {
        alert("Failed to update calendar month.");
      }
    });
  }
  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <h2 className="text-xl font-medium text-ink">Calendar collections</h2>
        <p className="mt-0.5 text-sm text-muted">
          Months are populated automatically from photograph dates.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-line border-y border-line">
        {calendars.map((cal) => (
          <div key={cal.id} className="py-8">
            {editingId === cal.id ? (
              <form
                onSubmit={(e) => handleEdit(e, cal.id)}
                className="flex flex-col gap-5"
              >
                <div>
                  <FieldLabel htmlFor={`cal-title-${cal.id}`}>Title</FieldLabel>
                  <FormInput
                    id={`cal-title-${cal.id}`}
                    type="text"
                    name="title"
                    defaultValue={cal.title}
                    required
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`cal-desc-${cal.id}`}>
                    Description
                  </FieldLabel>
                  <FormTextarea
                    id={`cal-desc-${cal.id}`}
                    name="description"
                    defaultValue={cal.description ?? ""}
                    rows={3}
                  />
                </div>
                <PhotoChecklist
                  photos={allPhotos}
                  linkedPhotos={cal.photos}
                  initialCoverId={cal.cover_photo_id}
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
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl font-medium leading-snug tracking-tight text-ink">
                    {cal.title}
                  </h3>
                  {cal.description && (
                    <p className="mt-1.5 text-[15px] text-muted">
                      {cal.description}
                    </p>
                  )}
                  <PhotoThumbnails
                    photos={cal.photos}
                    fallbackTitle={cal.title}
                    className="mt-4"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(cal.id)}
                  className="shrink-0"
                >
                  Edit details & cover
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
