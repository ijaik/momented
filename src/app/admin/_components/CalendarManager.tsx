import { editCalendarCollectionAction } from "@/actions/calendar";
import ItemManager, { type BaseItem } from "./ItemManager";
import type { ChecklistPhoto } from "./PhotoChecklist";

export type CalendarItem = BaseItem<string | number>;
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
      descName="description"
      descLabel="Description"
      editAction={editCalendarCollectionAction}
      renderContent={(cal) =>
        cal.description ? (
          <p className="mt-1.5 text-[15px] text-muted">{cal.description}</p>
        ) : null
      }
    />
  );
}
