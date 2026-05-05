'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { TaskEditDialog } from '@/components/dashboard/TaskEditDialog';
import { TaskListDialog } from '@/components/dashboard/TaskListDialog';
import { type Task, type TaskStatus } from '@/lib/types';
import { useState } from 'react';

const supabase = createClient();

export default function WidgetPage() {
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialog, setDialog] = useState<{ title: string; status?: TaskStatus; due?: 'today' } | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['widget', 'summary'],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('status, priority, due_date, title, id, project_id').eq('user_id', user!.id);
      const tasks = data ?? [];
      const today = new Date().toISOString().split('T')[0];
      return {
        total: tasks.length,
        done: tasks.filter((t) => t.status === 'done').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        dueToday: tasks.filter((t) => t.due_date === today).length,
        urgentList: tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').slice(0, 5) as Task[],
        dueList: tasks.filter((t) => t.due_date === today && t.status !== 'done').slice(0, 5) as Task[],
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  if (!stats) return null;

  return (
    <>
      <div className="min-h-screen bg-zinc-50 p-3 select-none">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: '总', value: stats.total, icon: ListTodo, color: 'text-zinc-500', onClick: () => setDialog({ title: '全部任务' }) },
            { label: '完', value: stats.done, icon: CheckCircle, color: 'text-green-500', onClick: () => setDialog({ title: '已完成', status: 'done' }) },
            { label: '行', value: stats.inProgress, icon: Clock, color: 'text-blue-500', onClick: () => setDialog({ title: '进行中', status: 'in_progress' }) },
            { label: '今', value: stats.dueToday, icon: AlertCircle, color: 'text-orange-500', onClick: () => setDialog({ title: '今日到期', due: 'today' }) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center rounded-lg bg-white border p-2 hover:shadow transition-shadow"
            >
              <item.icon className={`h-4 w-4 ${item.color} mb-0.5`} />
              <span className="text-lg font-bold text-zinc-900">{item.value}</span>
              <span className="text-[10px] text-zinc-400">{item.label}</span>
            </button>
          ))}
        </div>

        {stats.urgentList.length > 0 && (
          <div className="mb-2">
            <p className="text-[11px] font-medium text-red-500 mb-1">紧急</p>
            <div className="space-y-0.5">
              {stats.urgentList.map((t) => (
                <button key={t.id} type="button" onClick={() => setEditingTask(t)} className="block w-full text-left text-xs text-zinc-700 truncate rounded px-2 py-1 bg-white border hover:bg-red-50">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {stats.dueList.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-orange-500 mb-1">今日到期</p>
            <div className="space-y-0.5">
              {stats.dueList.map((t) => (
                <button key={t.id} type="button" onClick={() => setEditingTask(t)} className="block w-full text-left text-xs text-zinc-700 truncate rounded px-2 py-1 bg-white border hover:bg-orange-50">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskEditDialog task={editingTask} open={!!editingTask} onClose={() => { setEditingTask(null); queryClient.invalidateQueries({ queryKey: ['widget'] }); }} />
      <TaskListDialog open={!!dialog} onClose={() => setDialog(null)} title={dialog?.title ?? ''} status={dialog?.status} due={dialog?.due} />
    </>
  );
}
