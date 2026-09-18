import {
  createCollectionAction,
  deleteCollectionAction,
  editCollectionAction,
} from "@/actions/collections";
import ItemManager, { type BaseItem } from "./ItemManager";
import type { ChecklistPhoto } from "./PhotoChecklist";
interface CollectionManagerProps {
  collections: BaseItem[];
  allPhotos: ChecklistPhoto[];
}
export default function CollectionManager({
  collections,
  allPhotos,
}: CollectionManagerProps) {
  return (
    <ItemManager
      items={collections}
      allPhotos={allPhotos}
      title="Collections"
      newItemLabel="New collection"
      titlePlaceholder="Collection title"
      descName="description"
      descLabel="Description"
      descPlaceholder="The theme or mood of this collection"
      createAction={createCollectionAction}
      editAction={editCollectionAction}
      deleteAction={deleteCollectionAction}
      renderContent={(col) => (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          {col.description}
        </p>
      )}
    />
  );
}