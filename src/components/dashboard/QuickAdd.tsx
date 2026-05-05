'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTags } from '@/lib/hooks/useTags';
import { useCreateTask } from '@/lib/hooks/useTasks';
import { useSetTaskTags } from '@/lib/hooks/useTaskTags';
import { showSuccess, showError } from '@/components/shared/Toast';
import { type TaskPriority, type TaskStatus, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: projects } = useProjects();
  const { data: allTags = [] } = useTags();
  const createTask = useCreateTask();
  const setTaskTags = useSetTaskTags();

  function reset() {
    setTitle('');
    setDescription('');
    setProjectId('');
    setStatus('todo');
    setPriority('medium');
    setDueDate('');
    setSelectedTags([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    try {
      const created = await createTask.mutateAsync({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
        position: 0,
      });

      if (selectedTags.length > 0) {
        await setTaskTags.mutateAsync({ taskId: created.id, tagIds: selectedTags });
      }

      showSuccess('任务已创建');
      reset();
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800">
        <Plus className="h-4 w-4" />
        新建任务
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qa-title">任务标题</Label>
            <Input
              id="qa-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qa-desc">描述</Label>
            <Textarea
              id="qa-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="任务描述（选填）"
            />
          </div>

          <div className="space-y-2">
            <Label>所属项目</Label>
            <Select value={projectId} onValueChange={(v) => v && setProjectId(v)} required>
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
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
              <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
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
              <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qa-due">截止日期</Label>
            <Input id="qa-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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

          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? '创建中...' : '创建任务'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
