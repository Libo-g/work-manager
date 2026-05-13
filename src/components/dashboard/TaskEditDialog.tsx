'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task, type TaskStatus, type TaskPriority, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import type { RecurrenceType } from '@/lib/types';
import { RecurrencePicker } from '@/components/shared/RecurrencePicker';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTags } from '@/lib/hooks/useTags';
import { useTaskTags, useSetTaskTags } from '@/lib/hooks/useTaskTags';
import { showSuccess, showError } from '@/components/shared/Toast';
import { SubtaskList } from '@/components/shared/SubtaskList';
import { Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskEditDialog({ task, open, onClose }: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | null>(null);
  const [nextDueDate, setNextDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: projects = [] } = useProjects();
  const { data: allTags = [] } = useTags();
  const { data: currentTagIds = [] } = useTaskTags(task?.id);
  const setTaskTags = useSetTaskTags();
  const tagsInitialized = useRef(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setProjectId(task.project_id);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
      setRecurrenceType(task.recurrence_type ?? null);
      setNextDueDate(task.next_due_date ?? '');
      tagsInitialized.current = false;
    }
  }, [task?.id]);

  useEffect(() => {
    if (!tagsInitialized.current) {
      setSelectedTags([...currentTagIds]);
      tagsInitialized.current = true;
    }
  }, [currentTagIds, task?.id]);

  if (!task) return null;

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    try {
      await Promise.all([
        updateTask.mutateAsync({
          id: task!.id,
          title: title.trim(),
          description: description.trim() || null,
          project_id: projectId || undefined,
          status,
          priority,
          due_date: dueDate || null,
          recurrence_type: recurrenceType || null,
          next_due_date: recurrenceType ? (nextDueDate || dueDate || null) : null,
          recurrence_start: recurrenceType ? (task!.recurrence_start ?? new Date().toISOString()) : null,
        }),
        setTaskTags.mutateAsync({ taskId: task!.id, tagIds: selectedTags }),
      ]);
      showSuccess('已保存');
      onClose();
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
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">编辑任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ed-title">标题</Label>
            <Input id="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ed-desc">描述</Label>
            <Textarea
              id="ed-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="添加描述..."
            />
          </div>

          <RecurrencePicker value={recurrenceType} onChange={setRecurrenceType} />

          <div className="space-y-2">
            <Label>所属项目</Label>
            <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
              <SelectTrigger>
                <SelectValue>
                  {projects.find((p) => p.id === projectId)?.name ?? '选择项目'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue>{STATUS_LABELS[status]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue>{PRIORITY_LABELS[priority]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ed-due">截止日期</Label>
            <Input id="ed-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTags.includes(tag.id) ? 'text-white border-transparent' : 'hover:bg-zinc-100'
                    }`}
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color, borderColor: tag.color }
                        : { borderColor: tag.color, color: tag.color }
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 子任务 */}
          <div className="pt-4 border-t">
            <SubtaskList taskId={task.id} projectId={task.project_id} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={updateTask.isPending}>
              {updateTask.isPending ? '保存中...' : '保存'}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteTask.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t">
            <p>创建时间: {new Date(task.created_at).toLocaleString('zh-CN')}</p>
            <p>更新时间: {new Date(task.updated_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
