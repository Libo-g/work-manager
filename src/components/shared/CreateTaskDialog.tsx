'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTags } from '@/lib/hooks/useTags';
import { useCreateTask } from '@/lib/hooks/useTasks';
import { useCreateSubtask } from '@/lib/hooks/useSubtasks';
import { useSetTaskTags } from '@/lib/hooks/useTaskTags';
import { showSuccess, showError } from '@/components/shared/Toast';
import { type TaskPriority, type TaskStatus, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import type { RecurrenceType } from '@/lib/types';
import { RecurrencePicker } from '@/components/shared/RecurrencePicker';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

export function CreateTaskDialog({ open, onOpenChange, defaultProjectId }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtaskTitles, setSubtaskTitles] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const { data: projects } = useProjects();
  const { data: allTags = [] } = useTags();
  const createTask = useCreateTask();
  const createSubtask = useCreateSubtask();
  const setTaskTags = useSetTaskTags();

  useEffect(() => {
    if (open && defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [open, defaultProjectId]);

  function reset() {
    setTitle('');
    setDescription('');
    setProjectId('');
    setStatus('todo');
    setPriority('medium');
    setDueDate('');
    setRecurrenceType(null);
    setSelectedTags([]);
    setSubtaskTitles([]);
    setSubtaskInput('');
  }

  function addSubtask() {
    const t = subtaskInput.trim();
    if (!t) return;
    setSubtaskTitles((prev) => [...prev, t]);
    setSubtaskInput('');
  }

  function removeSubtask(index: number) {
    setSubtaskTitles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    try {
      const nextDueDate = recurrenceType && dueDate ? dueDate : null;
      const recurrenceStart = recurrenceType ? new Date().toISOString() : null;

      const created = await createTask.mutateAsync({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
        position: 0,
        recurrence_type: recurrenceType || null,
        next_due_date: nextDueDate,
        recurrence_start: recurrenceStart,
      });

      if (subtaskTitles.length > 0) {
        await Promise.all(
          subtaskTitles.map((st) =>
            createSubtask.mutateAsync({ parent_id: created.id, project_id: projectId, title: st })
          )
        );
      }

      if (selectedTags.length > 0) {
        await setTaskTags.mutateAsync({ taskId: created.id, tagIds: selectedTags });
      }

      showSuccess('任务已创建');
      reset();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '创建失败';
      showError(`创建失败：${msg}`);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ct-title">任务标题</Label>
            <Input
              id="ct-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ct-desc">描述</Label>
            <Textarea
              id="ct-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="任务描述（选填）"
            />
          </div>

          <RecurrencePicker value={recurrenceType} onChange={setRecurrenceType} />

          <div className="space-y-2">
            <Label>所属项目</Label>
            <Select
              value={projectId}
              onValueChange={(v) => v && setProjectId(v)}
              disabled={!projects}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={projects ? '选择项目' : '加载中...'} />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue>{STATUS_LABELS[status]}</SelectValue></SelectTrigger>
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
                <SelectTrigger><SelectValue>{PRIORITY_LABELS[priority]}</SelectValue></SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ct-due">截止日期</Label>
            <Input id="ct-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                      selectedTags.includes(tag.id)
                        ? 'text-white border-transparent'
                        : 'hover:bg-zinc-100'
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

          <div className="space-y-2">
            <Label>子任务</Label>
            <div className="flex gap-2">
              <Input
                placeholder="添加子任务..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                className="h-8 text-sm"
              />
              <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={addSubtask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subtaskTitles.length > 0 && (
              <div className="space-y-1">
                {subtaskTitles.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 group py-0.5">
                    <span className="w-4 h-4 rounded border-2 border-zinc-300 shrink-0" />
                    <span className="text-sm flex-1 truncate text-zinc-700">{st}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? '创建中...' : '创建任务'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
