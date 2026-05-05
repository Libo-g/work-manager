import { Badge } from '@/components/ui/badge';
import { type TaskStatus, STATUS_LABELS } from '@/lib/types';

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
