import {
  createRuleCollectionAction,
  deleteRuleCollectionAction,
  editRuleCollectionAction,
} from "@/app/actions/admin";
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
      title="Photography Rules"
      newItemLabel="+ New Rule Collection"
      titlePlaceholder="Rule Name (e.g., Rule of Thirds)"
      descName="description"
      descPlaceholder="Description / Technique details..."
      createAction={createRuleCollectionAction}
      editAction={editRuleCollectionAction}
      deleteAction={deleteRuleCollectionAction}
      renderContent={(rule) => (
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          {rule.description}
        </p>
      )}
    />
  );
}
