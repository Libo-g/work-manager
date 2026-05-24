'use client';

import { type Task, type TaskStatus, STATUS_ORDER, STATUS_LABELS } from '@/lib/types';
import { BoardColumn } from './BoardColumn';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useUpdateTask } from '@/lib/hooks/useTasks';
import { showError } from '@/components/shared/Toast';
import { useState } from 'react';

interface BoardColumnsProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  projectMap?: Map<string, { name: string; color: string }>;
}

export function BoardColumns({ tasks, onTaskClick, projectMap }: BoardColumnsProps) {
  const updateTask = useUpdateTask();
  const [mobileStatus, setMobileStatus] = useState<TaskStatus>('todo');

  function getColumnTasks(status: TaskStatus): Task[] {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  async function handleDragEnd(result: DropResult) {
    const { draggableId, source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const columnTasks = getColumnTasks(newStatus);

    let newPosition: number;
    if (columnTasks.length === 0) {
      newPosition = 0;
    } else if (destination.index === 0) {
      newPosition = columnTasks[0].position - 1000;
    } else if (destination.index >= columnTasks.length) {
      newPosition = columnTasks[columnTasks.length - 1].position + 1000;
    } else {
      const before = columnTasks[destination.index - 1]?.position ?? 0;
      const after = columnTasks[destination.index]?.position ?? 0;
      newPosition = Math.floor((before + after) / 2);
    }

    try {
      await updateTask.mutateAsync({
        id: draggableId,
        status: newStatus,
        position: newPosition,
      });
    } catch {
      showError('操作失败，已回滚');
    }
  }

  return (
    <>
      {/* Mobile: tab bar + single column */}
      <div className="lg:hidden space-y-3">
        <div className="flex rounded-lg bg-zinc-100 p-1 gap-1">
          {STATUS_ORDER.map((s) => {
            const count = getColumnTasks(s).length;
            const active = mobileStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setMobileStatus(s)}
                className={`flex-1 text-sm rounded-md py-2 px-3 transition-colors ${
                  active
                    ? 'bg-white text-zinc-900 shadow-sm font-medium'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {STATUS_LABELS[s]} · {count}
              </button>
            );
          })}
        </div>
        <BoardColumn
          status={mobileStatus}
          tasks={getColumnTasks(mobileStatus)}
          onTaskClick={onTaskClick}
          projectMap={projectMap}
          compact
          droppable={false}
        />
      </div>

      {/* Desktop: three-column drag-and-drop layout */}
      <div className="hidden lg:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={getColumnTasks(status)}
                onTaskClick={onTaskClick}
                projectMap={projectMap}
                compact
                droppable={status !== 'done'}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}
