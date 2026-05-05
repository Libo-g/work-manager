'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { format, isPast, parseISO, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Task } from '@/lib/types';
import Link from 'next/link';

const supabase = createClient();

export function UpcomingDeadlines() {
  const { user } = useAuth();

  const { data: tasks } = useQuery({
    queryKey: ['dashboard', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  if (!tasks?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">即将到期</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.slice(0, 5).map((task) => {
          const dueDate = parseISO(task.due_date!);
          const past = isPast(dueDate) && !isToday(dueDate);
          return (
            <Link
              key={task.id}
              href="/board"
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-50 transition-colors"
            >
              <span className={`text-sm truncate ${past ? 'text-red-600' : 'text-zinc-700'}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={task.priority} />
                <span className={`text-xs ${past ? 'text-red-500' : 'text-zinc-400'}`}>
                  {format(dueDate, 'M月d日', { locale: zhCN })}
                </span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
