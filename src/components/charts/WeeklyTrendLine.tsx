'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

interface WeeklyTrendLineProps {
  tasks: Task[];
  days: number;
}

export function WeeklyTrendLine({ tasks, days }: WeeklyTrendLineProps) {
  const today = new Date();
  const data = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'M/d'),
      created: tasks.filter((t) => format(parseISO(t.created_at), 'yyyy-MM-dd') === dateStr).length,
      completed: tasks.filter(
        (t) => t.status === 'done' && format(parseISO(t.updated_at), 'yyyy-MM-dd') === dateStr
      ).length,
    };
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">趋势图（近 {days} 天）</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis allowDecimals={false} width={30} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#3B82F6" name="新建" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="completed" stroke="#22C55E" name="完成" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
