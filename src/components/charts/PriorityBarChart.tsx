'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task, PRIORITY_LABELS, PRIORITY_COLORS, type TaskPriority } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

interface PriorityBarChartProps {
  tasks: Task[];
}

export function PriorityBarChart({ tasks }: PriorityBarChartProps) {
  const data = PRIORITY_ORDER.map((p) => ({
    name: PRIORITY_LABELS[p],
    value: tasks.filter((t) => t.priority === p).length,
    fill: PRIORITY_COLORS[p],
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">优先级分布</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
