'use client';

import { type Task, type TaskStatus, STATUS_LABELS } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Inbox } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { DroppableProvided } from '@hello-pangea/dnd';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  projectMap?: Map<string, { name: string; color: string }>;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: 'border-t-zinc-400',
  in_progress: 'border-t-blue-400',
  done: 'border-t-green-400',
};

export function BoardColumn({ status, tasks, onTaskClick, projectMap }: BoardColumnProps) {
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-zinc-600">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg border-t-2 ${COLUMN_COLORS[status]} bg-zinc-100/50 p-2 space-y-2 min-h-[200px] transition-colors`}
          >
            {tasks.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="暂无任务"
                description="新建任务将在此处显示"
              />
            )}
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      isDragging={snapshot.isDragging}
                      onClick={() => onTaskClick(task)}
                      projectName={projectMap?.get(task.project_id)?.name}
                      projectColor={projectMap?.get(task.project_id)?.color}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
