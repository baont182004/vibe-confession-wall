import { PlanItemCard } from './PlanItemCard';

export const WeeklyItemCard = ({ item, disableActions, disableToggle, onEdit, onDelete, onToggle }) => {
  return (
    <PlanItemCard
      item={item}
      disableActions={disableActions}
      disableToggle={disableToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggle={onToggle}
    />
  );
};
