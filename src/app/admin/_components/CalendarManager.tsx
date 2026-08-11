"use client";
import Image from "next/image";
import { type SubmitEvent, useState, useTransition } from "react";
import { editCalendarCollectionAction } from "@/app/actions/admin";
import {
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/AdminForms";
import PhotoChecklist, { type ChecklistPhoto } from "./PhotoChecklist";

export interface CalendarItem {
  id: string | number;
  title: string;
  description?: string;
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
    <div className="flex flex-col gap-8 w-full">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Calendar Collections
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {calendars.map((cal) => (
          <div
            key={cal.id}
            className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            {editingId === cal.id ? (
              <form
                onSubmit={(e) => handleEdit(e, cal.id)}
                className="flex flex-col gap-4"
              >
                <FormInput
                  type="text"
                  name="title"
                  defaultValue={cal.title}
                  required
                />
                <FormTextarea
                  name="description"
                  defaultValue={cal.description}
                  rows={3}
                />
                <PhotoChecklist
                  photos={allPhotos}
                  linkedPhotos={cal.photos || []}
                  initialCoverId={cal.cover_photo_id}
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
            ) : (
              <>
                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">
                  {cal.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-2">{cal.description}</p>
                {cal.photos && cal.photos.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {cal.photos.map((p) => (
                      <Image
                        key={p.id}
                        src={p.cloudinary_url}
                        alt={p.title || cal.title}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-cover rounded-md shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingId(cal.id)}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400"
                  >
                    Edit Cover & Details
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
