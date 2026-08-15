import {
  createStoryAction,
  deleteStoryAction,
  editStoryAction,
} from "@/actions/admin";
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
      title="Your Stories"
      newItemLabel="+ Write New Story"
      titlePlaceholder="Story Title"
      descName="content"
      descPlaceholder="Write the narrative here..."
      descRows={8}
      createAction={createStoryAction}
      editAction={editStoryAction}
      deleteAction={deleteStoryAction}
      renderContent={(story) => (
        <p className="text-zinc-600 dark:text-zinc-400 mt-4 line-clamp-3 leading-relaxed">
          {story.content}
        </p>
      )}
    />
  );
}
