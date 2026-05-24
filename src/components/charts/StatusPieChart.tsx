'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task, STATUS_LABELS, type TaskStatus, STATUS_ORDER } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#A1A1AA',
  in_progress: '#3B82F6',
  done: '#22C55E',
};

interface StatusPieChartProps {
  tasks: Task[];
}

import type { PieLabelRenderProps } from 'recharts';

function renderLabel(props: PieLabelRenderProps) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = '', value = 0 } = props;
  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius) + 30;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > Number(cx) ? 'start' : 'end';

  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#52525b" fontSize={12}>
      <tspan x={x} dy="0">{name}</tspan>
      <tspan x={x} dy="16" fill="#a1a1aa">{value} 个 ({Math.round(Number(percent) * 100)}%)</tspan>
    </text>
  );
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
        <ResponsiveContainer width="100%" height={320}>
          <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              dataKey="value"
              label={renderLabel}
              labelLine={{ stroke: '#d4d4d8', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value: string) => <span className="text-sm text-zinc-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
