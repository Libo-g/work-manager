'use client';

import { useSubtasks, useCreateSubtask, useUpdateSubtask, useDeleteSubtask } from '@/lib/hooks/useSubtasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { showSuccess, showError } from '@/components/shared/Toast';

interface SubtaskListProps {
  taskId: string;
  projectId: string;
}

export function SubtaskList({ taskId, projectId }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const { data: subtasks = [], isLoading } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      await createSubtask.mutateAsync({
        parent_id: taskId,
        project_id: projectId,
        title: newTitle.trim(),
      });
      setNewTitle('');
      showSuccess('子任务已添加');
    } catch (e: unknown) {
      showError('添加失败');
    }
  }

  async function handleToggle(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    await updateSubtask.mutateAsync({ id, status: newStatus, parent_id: taskId });
  }

  async function handleDelete(id: string) {
    await deleteSubtask.mutateAsync({ id, parentId: taskId });
  }

  const completed = subtasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-700">
          子任务 {subtasks.length > 0 && `(${completed}/${subtasks.length})`}
        </span>
      </div>

      {/* Add new subtask */}
      <div className="flex gap-2">
        <Input
          placeholder="添加子任务..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          className="h-8 text-sm"
        />
        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCreate} disabled={createSubtask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtask list */}
      {isLoading ? (
        <p className="text-xs text-zinc-400">加载中...</p>
      ) : subtasks.length > 0 ? (
        <div className="space-y-1">
          {subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2 group py-0.5">
              <button
                type="button"
                onClick={() => handleToggle(sub.id, sub.status)}
                className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  sub.status === 'done'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-zinc-300 hover:border-zinc-400'
                }`}
              >
                {sub.status === 'done' && (
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className={`text-sm flex-1 truncate ${sub.status === 'done' ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                {sub.title}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(sub.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
