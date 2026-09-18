import {
  createRuleCollectionAction,
  deleteRuleCollectionAction,
  editRuleCollectionAction,
} from "@/actions/collections";
import ItemManager, { type BaseItem } from "./ItemManager";
import type { ChecklistPhoto } from "./PhotoChecklist";
interface RuleManagerProps {
  rules: BaseItem[];
  allPhotos: ChecklistPhoto[];
}
export default function RuleManager({ rules, allPhotos }: RuleManagerProps) {
  return (
    <ItemManager
      items={rules}
      allPhotos={allPhotos}
      title="Photography rules"
      newItemLabel="New rule collection"
      titlePlaceholder="Rule name, e.g. Rule of thirds"
      descName="description"
      descLabel="Description"
      descPlaceholder="Describe the technique or constraint"
      createAction={createRuleCollectionAction}
      editAction={editRuleCollectionAction}
      deleteAction={deleteRuleCollectionAction}
      renderContent={(rule) => (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          {rule.description}
        </p>
      )}
    />
  );
}