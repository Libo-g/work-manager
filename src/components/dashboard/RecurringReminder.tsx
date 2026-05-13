'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TaskEditDialog } from './TaskEditDialog';
import { addDays, parseISO, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Task, RecurrenceType } from '@/lib/types';
import { RECURRENCE_LABELS, RECURRENCE_REMINDER_DAYS } from '@/lib/types';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

const supabase = createClient();

function daysDiff(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function RecurringReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks } = useQuery({
    queryKey: ['dashboard', 'recurring-reminder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .not('recurrence_type', 'is', null)
        .not('next_due_date', 'is', null)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  if (!tasks?.length) return null;

  const now = new Date();
  const inWindow = tasks.filter((task) => {
    const type = task.recurrence_type as RecurrenceType;
    const days = RECURRENCE_REMINDER_DAYS[type];
    if (!days) return false;
    const nextDue = parseISO(task.next_due_date!);
    const start = addDays(nextDue, -days);
    return now >= start && now < nextDue;
  });

  if (!inWindow.length) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            周期任务提醒
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {inWindow.map((task) => {
            const nextDue = parseISO(task.next_due_date!);
            const remaining = daysDiff(nextDue, now);
            const urgent = remaining <= 1;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setEditingTask(task)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-sm truncate ${urgent ? 'text-red-600 font-medium' : 'text-zinc-700'}`}>
                    {task.title}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
                    {RECURRENCE_LABELS[task.recurrence_type as RecurrenceType]}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs ${urgent ? 'text-red-500 font-medium' : 'text-zinc-400'}`}>
                    {remaining <= 0 ? '今日到期' : `还剩 ${remaining} 天`}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {format(nextDue, 'M月d日', { locale: zhCN })}
                  </span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onClose={() => {
          setEditingTask(null);
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </>
  );
}
