import {
  createCollectionAction,
  deleteCollectionAction,
  editCollectionAction,
} from "@/app/actions/admin";
import ItemManager from "./ItemManager";
export default function CollectionManager({ collections, allPhotos }) {
  return (
    <ItemManager
      items={collections}
      allPhotos={allPhotos}
      title="Your Collections"
      newItemLabel="+ New Collection"
      titlePlaceholder="Collection Title"
      descName="description"
      descPlaceholder="Theme / Description"
      createAction={createCollectionAction}
      editAction={editCollectionAction}
      deleteAction={deleteCollectionAction}
      renderContent={(col) => (
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {col.description}
        </p>
      )}
    />
  );
}
