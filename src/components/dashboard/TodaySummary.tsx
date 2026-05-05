'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { TaskListDialog } from './TaskListDialog';
import { useState } from 'react';
import type { ComponentType } from 'react';
import type { TaskPriority, TaskStatus } from '@/lib/types';

const supabase = createClient();

interface DialogState {
  title: string;
  status?: TaskStatus;
  due?: 'today';
  priority?: TaskPriority;
}

export function TodaySummary() {
  const { user } = useAuth();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date')
        .eq('user_id', user!.id);

      if (error) throw error;

      const tasks = data ?? [];
      const today = new Date().toISOString().split('T')[0];

      return {
        total: tasks.length,
        done: tasks.filter((t) => t.status === 'done').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        urgent: tasks.filter((t) => t.priority === 'urgent').length,
        dueToday: tasks.filter((t) => t.due_date === today).length,
      };
    },
    enabled: !!user,
  });

  if (isLoading || !stats) return null;

  const items: Array<{
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    color: string;
    dialog: DialogState;
  }> = [
    { label: '总任务', value: stats.total, icon: ListTodo, color: 'text-zinc-600', dialog: { title: '全部任务' } },
    { label: '已完成', value: stats.done, icon: CheckCircle, color: 'text-green-600', dialog: { title: '已完成任务', status: 'done' } },
    { label: '进行中', value: stats.inProgress, icon: Clock, color: 'text-blue-600', dialog: { title: '进行中任务', status: 'in_progress' } },
    { label: '今日到期', value: stats.dueToday, icon: AlertCircle, color: 'text-orange-600', dialog: { title: '今日到期任务', due: 'today' } },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Card
            key={item.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setDialog(item.dialog)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{item.label}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dialog && (
        <TaskListDialog
          open={!!dialog}
          onClose={() => setDialog(null)}
          title={dialog.title}
          status={dialog.status}
          due={dialog.due}
          priority={dialog.priority}
        />
      )}
    </>
  );
}
