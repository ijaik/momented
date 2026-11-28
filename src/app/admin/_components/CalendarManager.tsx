import { editCalendarCollectionAction } from "@/actions/calendar";
import type { CalendarItem, ChecklistPhoto } from "@/types/admin";
import ItemManager from "./ItemManager";

export type { CalendarItem };

interface CalendarManagerProps {
  calendars: CalendarItem[];
  allPhotos: ChecklistPhoto[];
}
export default function CalendarManager({
  calendars,
  allPhotos,
}: CalendarManagerProps) {
  return (
    <ItemManager
      items={calendars}
      allPhotos={allPhotos}
      title="Calendar collections"
      subtitle="Months are populated automatically from photograph dates."
      editButtonLabel="Edit details & cover"
      editAction={editCalendarCollectionAction}
      renderContent={(cal) =>
        cal.description ? (
          <p className="mt-1.5 text-[15px] text-muted">{cal.description}</p>
        ) : null
      }
    />
  );
}
