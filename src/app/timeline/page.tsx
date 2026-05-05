'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { GanttChart } from '@/components/timeline/GanttChart';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { type Task, type Project } from '@/lib/types';

const supabase = createClient();

export default function TimelinePage() {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery({
    queryKey: ['timeline', 'tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['timeline', 'projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_archived', false);

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">时间线</h2>
      <GanttChart tasks={tasks} projects={projects} />
    </AppLayout>
  );
}
