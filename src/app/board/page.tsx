'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { BoardHeader } from '@/components/board/BoardHeader';
import { BoardColumns } from '@/components/board/BoardColumns';
import { TaskDrawer } from '@/components/board/TaskDrawer';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTasks, useCreateTask } from '@/lib/hooks/useTasks';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Task, type TaskPriority, type TaskStatus, STATUS_LABELS } from '@/lib/types';
import { showSuccess, showError } from '@/components/shared/Toast';
import { FolderKanban, Plus, X } from 'lucide-react';
import { useState, useMemo } from 'react';

function readStoredFilter(): { status: TaskStatus | 'all'; due: string | null } {
  if (typeof window === 'undefined') return { status: 'all', due: null };
  try {
    const raw = sessionStorage.getItem('boardFilter');
    if (raw) {
      const parsed = JSON.parse(raw);
      sessionStorage.removeItem('boardFilter');
      const s = parsed.status;
      const status = (s === 'todo' || s === 'in_progress' || s === 'done') ? s : 'all';
      return { status, due: parsed.due ?? null };
    }
  } catch { /* ignore */ }
  return { status: 'all', due: null };
}

export default function BoardPage() {
  const initFilter = useState(() => readStoredFilter())[0];

  // null = all projects
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>(initFilter.status);
  const [dueFilter, setDueFilter] = useState<string | null>(initFilter.due);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: tasks = [], isLoading } = useTasks(selectedProject);
  const createTask = useCreateTask();

  const today = new Date().toISOString().split('T')[0];

  // Build project lookup map
  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    projects.forEach((p) => map.set(p.id, { name: p.name, color: p.color }));
    return map;
  }, [projects]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (dueFilter === 'today' && task.due_date !== today) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, dueFilter, today]);

  function clearFilters() {
    setStatusFilter('all');
    setDueFilter(null);
    setPriorityFilter('all');
    setSearchQuery('');
  }

  const hasActiveFilter = statusFilter !== 'all' || dueFilter || priorityFilter !== 'all' || searchQuery;

  async function handleQuickCreate() {
    if (!selectedProject) {
      showError('请先选择一个项目再创建任务');
      return;
    }
    const title = window.prompt('输入任务标题:');
    if (!title?.trim()) return;

    try {
      await createTask.mutateAsync({
        project_id: selectedProject,
        title: title.trim(),
        status: 'todo',
        position: 0,
      });
      showSuccess('任务已创建');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '创建失败';
      showError(`创建失败：${msg}`);
    }
  }

  return (
    <AppLayout>
      <BoardHeader
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {hasActiveFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-zinc-400">筛选：</span>
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setStatusFilter('all')}>
              {STATUS_LABELS[statusFilter]}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {dueFilter === 'today' && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setDueFilter(null)}>
              今日到期
              <X className="h-3 w-3" />
            </Badge>
          )}
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPriorityFilter('all')}>
              优先级：{priorityFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 h-6" onClick={clearFilters}>
            清除全部
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-400">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Button size="sm" variant="outline" className="gap-1" onClick={handleQuickCreate}>
            <Plus className="h-4 w-4" />
            新建任务
          </Button>
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={hasActiveFilter ? '没有匹配的任务' : '暂无任务'}
              description={hasActiveFilter ? '尝试调整或清除筛选条件' : '选择一个项目后点击"新建任务"开始'}
              action={hasActiveFilter ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>清除筛选</Button>
              ) : undefined}
            />
          ) : (
            <BoardColumns
              tasks={filteredTasks}
              onTaskClick={setEditingTask}
              projectMap={selectedProject ? undefined : projectMap}
            />
          )}
        </div>
      )}

      <TaskDrawer
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
      />
    </AppLayout>
  );
}
