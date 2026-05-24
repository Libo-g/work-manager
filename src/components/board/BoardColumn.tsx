'use client';

import { type Task, type TaskStatus, STATUS_LABELS } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { DroppableProvided } from '@hello-pangea/dnd';
import { useState } from 'react';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  projectMap?: Map<string, { name: string; color: string }>;
  compact?: boolean;
  droppable?: boolean;
  fullWidth?: boolean;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: 'border-t-zinc-400',
  in_progress: 'border-t-blue-400',
  done: 'border-t-green-400',
};

const COMPACT_LIMIT = 20;

export function BoardColumn({
  status,
  tasks,
  onTaskClick,
  projectMap,
  compact,
  droppable = true,
  fullWidth,
}: BoardColumnProps) {
  const [expanded, setExpanded] = useState(false);

  const isCompact = compact && status === 'done' && tasks.length > COMPACT_LIMIT && !expanded;
  const displayTasks = isCompact ? tasks.slice(0, COMPACT_LIMIT) : tasks;

  function renderTask(task: Task, index: number) {
    const project = projectMap?.get(task.project_id);

    const card = (
      <TaskCard
        task={task}
        isDragging={false}
        onClick={() => onTaskClick(task)}
        projectName={project?.name}
        projectColor={project?.color}
      />
    );

    if (!droppable) {
      return <div key={task.id}>{card}</div>;
    }

    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {snapshot.isDragging ? (
              <TaskCard
                task={task}
                isDragging
                onClick={() => onTaskClick(task)}
                projectName={project?.name}
                projectColor={project?.color}
              />
            ) : (
              card
            )}
          </div>
        )}
      </Draggable>
    );
  }

  const isDone = status === 'done';
  const bodyClass = [
    'flex-1 rounded-lg border-t-2',
    COLUMN_COLORS[status],
    'bg-zinc-100/50 p-2 min-h-[200px] transition-colors',
    isDone ? 'grid grid-cols-2 gap-2 content-start' : 'space-y-2',
    isDone && compact ? 'max-h-[60vh] overflow-y-auto' : '',
  ].join(' ');

  const content = (
    <div className={bodyClass}>
      {tasks.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="暂无任务"
          description={status === 'done' ? '完成任务后将在此处显示' : '新建任务将在此处显示'}
        />
      )}
      {displayTasks.map((task, index) => renderTask(task, index))}
      {isCompact && (
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 text-xs text-zinc-400"
          onClick={() => setExpanded(true)}
        >
          展开全部 {tasks.length} 个已完成任务
        </Button>
      )}
      {expanded && tasks.length > COMPACT_LIMIT && (
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 text-xs text-zinc-400"
          onClick={() => setExpanded(false)}
        >
          收起，仅显示最近 {COMPACT_LIMIT} 个
        </Button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col ${fullWidth ? 'w-full' : isDone ? 'flex-1 min-w-0' : 'w-72 shrink-0'}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-zinc-600">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {droppable ? (
        <Droppable droppableId={status}>
          {(provided: DroppableProvided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {content}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        content
      )}
    </div>
  );
}
