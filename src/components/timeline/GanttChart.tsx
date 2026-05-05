'use client';

import { type Task, type Project } from '@/lib/types';
import { TaskEditDialog } from '@/components/dashboard/TaskEditDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { format, addDays, differenceInDays, parseISO, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface GanttChartProps {
  tasks: Task[];
  projects: Project[];
}

export function GanttChart({ tasks, projects }: GanttChartProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const queryClient = useQueryClient();

  const today = new Date();
  const baseMonth = addMonths(today, monthOffset);
  const rangeStart = startOfMonth(baseMonth);
  const rangeEnd = endOfMonth(baseMonth);
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // Only tasks with due dates, grouped by project
  const tasksWithDue = useMemo(() => {
    return tasks
      .filter((t) => t.due_date)
      .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''));
  }, [tasks]);

  if (tasksWithDue.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">甘特图</CardTitle></CardHeader>
        <CardContent className="text-center text-zinc-400 py-12">
          暂无带截止日期的任务，给任务添加截止日期后在此显示
        </CardContent>
      </Card>
    );
  }

  const dayWidth = Math.max(24, Math.floor(700 / totalDays));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">甘特图</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthOffset((o) => o - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-28 text-center">
                {format(baseMonth, 'yyyy年M月', { locale: zhCN })}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonthOffset((o) => o + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date header */}
          <div className="flex border-b pb-2 mb-2">
            <div className="w-40 shrink-0" />
            <div className="flex-1 overflow-x-auto">
              <div className="flex" style={{ width: totalDays * dayWidth }}>
                {Array.from({ length: totalDays }, (_, i) => {
                  const date = addDays(rangeStart, i);
                  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`text-center text-[10px] shrink-0 pt-1 ${
                        isToday ? 'bg-blue-100 rounded font-bold text-blue-600' : ''
                      } ${isWeekend ? 'text-zinc-300' : 'text-zinc-400'}`}
                      style={{ width: dayWidth }}
                    >
                      {format(date, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task rows */}
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {tasksWithDue.map((task) => {
              const proj = projectMap.get(task.project_id);
              const dueDate = parseISO(task.due_date!);
              const daysFromStart = differenceInDays(dueDate, rangeStart);

              // Status color
              const statusColors: Record<string, string> = {
                done: '#22C55E', in_progress: '#3B82F6', review: '#F59E0B', todo: '#A1A1AA',
              };

              return (
                <div key={task.id} className="flex items-center group hover:bg-zinc-50 rounded">
                  <div className="w-40 shrink-0 pr-2">
                    <button
                      type="button"
                      onClick={() => setEditingTask(task)}
                      className="text-xs text-zinc-700 truncate block w-full text-left hover:text-blue-600"
                    >
                      {task.title}
                    </button>
                    <span className="text-[10px] text-zinc-400">{proj?.name}</span>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div className="relative" style={{ width: totalDays * dayWidth, height: 24 }}>
                      {/* Today line */}
                      {monthOffset === 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-blue-400 z-10"
                          style={{ left: differenceInDays(today, rangeStart) * dayWidth + dayWidth / 2 }}
                        />
                      )}
                      {/* Task bar */}
                      {daysFromStart >= 0 && daysFromStart < totalDays && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-4 rounded-sm cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                          style={{
                            left: daysFromStart * dayWidth + 4,
                            width: Math.max(dayWidth - 8, 8),
                            backgroundColor: statusColors[task.status] ?? '#A1A1AA',
                          }}
                          title={`${task.title} — ${task.due_date}`}
                          onClick={() => setEditingTask(task)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-zinc-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#A1A1AA]" /> 待处理</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]" /> 进行中</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> 待审核</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#22C55E]" /> 已完成</span>
          </div>
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
