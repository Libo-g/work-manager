import { Badge } from '@/components/ui/badge';
import { type TaskPriority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/types';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      style={{ borderColor: PRIORITY_COLORS[priority], color: PRIORITY_COLORS[priority] }}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
