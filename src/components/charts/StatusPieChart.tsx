'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task, STATUS_LABELS, type TaskStatus, STATUS_ORDER } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#A1A1AA',
  in_progress: '#3B82F6',
  review: '#F59E0B',
  done: '#22C55E',
};

interface StatusPieChartProps {
  tasks: Task[];
}

export function StatusPieChart({ tasks }: StatusPieChartProps) {
  const data = STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).length,
    color: STATUS_COLORS[status],
  })).filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">任务状态分布</CardTitle></CardHeader>
        <CardContent className="text-center text-zinc-400 py-8">暂无数据</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">任务状态分布</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
