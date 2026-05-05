'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { type Task, type TaskStatus, type TaskPriority, STATUS_LABELS } from '@/lib/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

interface TaskListDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  status?: TaskStatus;
  due?: 'today';
  priority?: TaskPriority;
}

export function TaskListDialog({ open, onClose, title, status, due, priority }: TaskListDialogProps) {
  const { user } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'tasklist', status, due, priority],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, projects!inner(name, color)')
        .eq('user_id', user!.id);

      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (due === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('due_date', today);
      }

      query = query.order('updated_at', { ascending: false }).limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as (Task & { projects: { name: string; color: string } })[];
    },
    enabled: open && !!user,
    staleTime: 0,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title} ({tasks.length})</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-zinc-400 py-8">加载中...</p>
        ) : tasks.length === 0 ? (
          <EmptyState icon={Search} title="暂无匹配任务" description="去创建一些任务吧" />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href="/board"
                onClick={onClose}
                className="block rounded-lg border p-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: task.projects?.color ?? '#6B7280' }}
                  >
                    {task.projects?.name ?? '未知项目'}
                  </span>
                  <span className="text-xs text-zinc-300">|</span>
                  <span className="text-xs text-zinc-400">{STATUS_LABELS[task.status]}</span>
                  {task.due_date && (
                    <>
                      <span className="text-xs text-zinc-300">|</span>
                      <span className="text-xs text-zinc-400">截止 {task.due_date}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
