'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { type Task } from '@/lib/types';
import { GripVertical, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  return (
    <Card
      className={`group cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg rotate-2' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 mt-0.5 text-zinc-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{task.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Calendar className="h-3 w-3" />
            <span>{format(parseISO(task.due_date), 'M月d日', { locale: zhCN })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
