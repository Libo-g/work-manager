import type { DailySummary, TaskWithProject } from './types';
import { RECURRENCE_LABELS, type RecurrenceType } from '@/lib/types';

function todayString(): string {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function taskLine(task: TaskWithProject, showDate?: boolean): string {
  const project = task.projects?.name ?? '未分类';
  let line = `• [${project}] ${task.title}`;
  if (showDate && task.due_date) {
    const d = daysUntil(task.due_date);
    line += d <= 0 ? ' ⚠️逾期' : ` 还剩${d}天`;
  }
  return line;
}

export function composeMorningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  upcoming: TaskWithProject[],
  inProgressWeek: TaskWithProject[]
): { title: string; content: string } {
  const lines: string[] = [];
  const dateStr = todayString();

  lines.push(`${dateStr} 早安`);

  // Overdue first - most important
  if (overdue.length > 0) {
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    overdue.forEach((t) => lines.push(taskLine(t, true)));
  }

  // Due this week
  const urgent = [...inProgressWeek, ...upcoming].slice(0, 6);
  if (urgent.length > 0) {
    lines.push(`\n📌 本周内到期 (${urgent.length})`);
    urgent.forEach((t) => lines.push(taskLine(t, true)));
  }

  if (overdue.length === 0 && urgent.length === 0) {
    lines.push('\n✨ 暂无逾期或紧急任务');
  }

  // Stats
  lines.push(`\n📊 共${summary.total}项 | 进行中${summary.inProgress} | 待处理${summary.todo}`);

  return { title: `【任务提醒】${dateStr}`, content: lines.join('\n') };
}

export function composeEveningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  doneTasks: TaskWithProject[],
  inProgressTasks: TaskWithProject[],
  todoTasks: TaskWithProject[]
): { title: string; content: string } {
  const lines: string[] = [];
  const dateStr = todayString();

  lines.push(`${dateStr} 工作总结`);

  // Done today
  lines.push(`\n✅ 已完成 ${summary.done} 项`);
  doneTasks.slice(0, 5).forEach((t) => lines.push(taskLine(t)));

  // In progress
  if (inProgressTasks.length > 0) {
    lines.push(`\n📝 进行中 (${inProgressTasks.length})`);
    inProgressTasks.slice(0, 5).forEach((t) => lines.push(taskLine(t, true)));
  }

  // Overdue
  if (overdue.length > 0) {
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    overdue.slice(0, 3).forEach((t) => lines.push(taskLine(t, true)));
  }

  // Stats
  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  lines.push(`\n📊 完成率 ${pct}%  | 待处理${summary.todo}`);

  return { title: `【工作总结】${dateStr}`, content: lines.join('\n') };
}
