'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ChartFilters } from '@/components/charts/ChartFilters';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { PriorityBarChart } from '@/components/charts/PriorityBarChart';
import { WeeklyTrendLine } from '@/components/charts/WeeklyTrendLine';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { type Task } from '@/lib/types';
import { useState } from 'react';

const supabase = createClient();

export default function ChartsPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  const { data: tasks = [] } = useQuery({
    queryKey: ['charts', 'tasks', selectedProject],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').eq('user_id', user!.id);
      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const days = timeRange === 'all' ? 90 : parseInt(timeRange);

  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">图表分析</h2>
      <ChartFilters
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart tasks={tasks} />
        <PriorityBarChart tasks={tasks} />
      </div>
      <div className="mt-6">
        <WeeklyTrendLine tasks={tasks} days={days} />
      </div>
    </AppLayout>
  );
}
