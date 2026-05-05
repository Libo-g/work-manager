'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export function TodaySummary() {
  const { user } = useAuth();
  const router = useRouter();

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

  const items = [
    { label: '总任务', value: stats.total, icon: ListTodo, color: 'text-zinc-600', href: '/board?view=all' },
    { label: '已完成', value: stats.done, icon: CheckCircle, color: 'text-green-600', href: '/board?status=done' },
    { label: '进行中', value: stats.inProgress, icon: Clock, color: 'text-blue-600', href: '/board?status=in_progress' },
    { label: '今日到期', value: stats.dueToday, icon: AlertCircle, color: 'text-orange-600', href: '/board?due=today' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(item.href)}
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
  );
}
