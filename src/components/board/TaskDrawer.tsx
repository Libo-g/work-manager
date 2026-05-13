'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task, type TaskStatus, type TaskPriority, STATUS_LABELS, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/lib/types';
import type { RecurrenceType } from '@/lib/types';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTags } from '@/lib/hooks/useTags';
import { useTaskTags, useSetTaskTags } from '@/lib/hooks/useTaskTags';
import { useRecurringTaskHistory, useCompleteRecurringTask } from '@/lib/hooks/useRecurringTaskHistory';
import { RecurrencePicker } from '@/components/shared/RecurrencePicker';
import { showSuccess, showError } from '@/components/shared/Toast';
import { SubtaskList } from '@/components/shared/SubtaskList';
import { CheckCircle, Trash2, RotateCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, open, onClose }: TaskDrawerProps) {
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
  const completeRecurring = useCompleteRecurringTask();
  const { data: projects = [] } = useProjects();
  const { data: allTags = [] } = useTags();
  const { data: currentTagIds = [] } = useTaskTags(task?.id);
  const { data: history = [] } = useRecurringTaskHistory(task?.id);
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

  // Initialize selected tags once when server data arrives for the current task
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
    } catch {
      showError('保存失败');
    }
  }

  async function handleComplete() {
    if (!task?.recurrence_type || !task?.next_due_date) return;
    try {
      await completeRecurring.mutateAsync({
        taskId: task.id,
        recurrenceType: task.recurrence_type,
        nextDueDate: task.next_due_date,
      });
      showSuccess('已完成，已进入下一周期');
    } catch {
      showError('操作失败');
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
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="text-lg">任务详情</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 px-0.5 pb-6">
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

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
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
            <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue>{PRIORITY_LABELS[priority]}</SelectValue></SelectTrigger>
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

          {/* 标签选择 */}
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

          {/* 周期任务完成按钮 */}
          {task.recurrence_type && task.next_due_date && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-medium text-zinc-700">
                    {RECURRENCE_LABELS[task.recurrence_type]} · 下次到期
                  </span>
                  <span className="text-sm text-zinc-500 ml-2">
                    {new Date(task.next_due_date).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleComplete}
                  disabled={completeRecurring.isPending}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {completeRecurring.isPending ? '处理中...' : '完成'}
                </Button>
              </div>
            </div>
          )}

          {/* 完成历史 */}
          {task.recurrence_type && history.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-zinc-700 mb-2">完成记录</h4>
              <div className="space-y-2">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 text-xs text-zinc-500">
                    {entry.type === 'manual' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <RotateCw className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span>{new Date(entry.completed_date).toLocaleDateString('zh-CN')}</span>
                    <span className="text-zinc-400">
                      {entry.type === 'manual' ? '手动完成' : '自动顺延'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 子任务 */}
          {task && (
            <div className="pt-4 border-t">
              <SubtaskList taskId={task.id} projectId={task.project_id} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={updateTask.isPending || setTaskTags.isPending}>
              {updateTask.isPending || setTaskTags.isPending ? '保存中...' : '保存'}
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
