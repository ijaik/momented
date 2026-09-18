import {
  createStoryAction,
  deleteStoryAction,
  editStoryAction,
} from "@/actions/stories";
import ItemManager, { type BaseItem } from "./ItemManager";
import type { ChecklistPhoto } from "./PhotoChecklist";
interface StoryManagerProps {
  stories: BaseItem[];
  allPhotos: ChecklistPhoto[];
}
export default function StoryManager({
  stories,
  allPhotos,
}: StoryManagerProps) {
  return (
    <ItemManager
      items={stories}
      allPhotos={allPhotos}
      title="Stories"
      newItemLabel="Write a story"
      titlePlaceholder="Story title"
      descName="content"
      descLabel="Story"
      descPlaceholder="Write the narrative here…"
      descRows={8}
      createAction={createStoryAction}
      editAction={editStoryAction}
      deleteAction={deleteStoryAction}
      renderContent={(story) => (
        <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-muted line-clamp-3">
          {story.content}
        </p>
      )}
    />
  );
}