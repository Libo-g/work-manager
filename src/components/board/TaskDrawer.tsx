'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task, type TaskStatus, type TaskPriority, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { showSuccess, showError } from '@/components/shared/Toast';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, open, onClose }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
    }
  }, [task]);

  if (!task) return null;

  async function handleSave() {
    if (!title.trim()) return;
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDate || null,
      });
      showSuccess('已保存');
    } catch {
      showError('保存失败');
    }
  }

  async function handleDelete() {
    try {
      await deleteTask.mutateAsync({ id: task!.id, projectId: task!.project_id });
      showSuccess('已删除');
      onClose();
    } catch {
      showError('删除失败');
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">任务详情</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">标题</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">描述</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="添加描述..."
            />
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>优先级</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due">截止日期</Label>
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={updateTask.isPending}>
              {updateTask.isPending ? '保存中...' : '保存'}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteTask.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-zinc-400 space-y-1 pt-4 border-t">
            <p>创建时间: {new Date(task.created_at).toLocaleString('zh-CN')}</p>
            <p>更新时间: {new Date(task.updated_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
