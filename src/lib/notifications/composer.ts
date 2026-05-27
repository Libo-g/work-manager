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

function taskLine(task: TaskWithProject): string {
  const project = task.projects?.name ?? '未分类';
  return `• [${project}] ${task.title}`;
}

const MORNING_GREETINGS = [
  '早上好！新的一天，先看看今天的任务安排吧 ☀️',
  '早上好！一日之计在于晨，来看看今天的任务清单 🌅',
  '早安！准备好迎接新一天的挑战了吗？来看看今天的任务吧 🌤️',
];

const MORNING_CLOSINGS = [
  '加油，今天也要高效完成任务 💪',
  '合理安排，从容应对，祝你今天工作顺利 ✨',
  '心中有数，脚下有路，今天也要元气满满 🚀',
];

const EVENING_GREETINGS = [
  '下班啦！来看看今天的工作成果 🎉',
  '收工！回顾一下今天的工作吧 🏠',
  '一天的工作结束了，来做个总结 📋',
];

const EVENING_CLOSINGS = [
  '辛苦啦，今天的班就上到这，明天继续加油 💼',
  '今天辛苦了，好好休息，明天见 🌙',
  '干得不错！放下工作，享受下班时光吧 🍵',
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function composeMorningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  upcoming: TaskWithProject[],
  inProgressWeek: TaskWithProject[]
): { title: string; content: string } {
  const lines: string[] = [];
  const dateStr = todayString();

  lines.push(pick(MORNING_GREETINGS));

  // Overdue first
  if (overdue.length > 0) {
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    overdue.forEach((t) => {
      const label = t.due_date ? ` - 截止 ${formatDate(t.due_date)}` : '';
      lines.push(taskLine(t) + label);
    });
  }

  // Due this week
  const urgent = [...inProgressWeek, ...upcoming].slice(0, 6);
  if (urgent.length > 0) {
    lines.push(`\n📌 本周内到期`);
    urgent.forEach((t) => {
      if (t.due_date) {
        const d = daysUntil(t.due_date);
        const label = d <= 0 ? '今日到期' : `还剩 ${d} 天`;
        lines.push(`${taskLine(t)} - ${label}`);
      } else if (t.next_due_date) {
        const d = daysUntil(t.next_due_date);
        lines.push(`${taskLine(t)} - 还剩 ${d} 天`);
      }
    });
  }

  if (overdue.length === 0 && urgent.length === 0) {
    lines.push('\n✨ 暂无逾期或紧急任务，继续保持！');
  }

  // Stats
  lines.push(`\n📊 共${summary.total}项 | 进行中${summary.inProgress} | 待处理${summary.todo}`);
  lines.push(`\n${pick(MORNING_CLOSINGS)}`);

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

  lines.push(pick(EVENING_GREETINGS));

  // Done
  lines.push(`\n✅ 已完成 ${summary.done} 项`);
  doneTasks.slice(0, 5).forEach((t) => lines.push(taskLine(t)));

  // In progress
  if (inProgressTasks.length > 0) {
    lines.push(`\n📝 进行中 (${inProgressTasks.length})`);
    inProgressTasks.slice(0, 5).forEach((t) => {
      const mark = t.due_date && new Date(t.due_date) < new Date() ? ' ⚠️' : '';
      lines.push(taskLine(t) + mark);
    });
  }

  // Overdue
  if (overdue.length > 0) {
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    overdue.slice(0, 3).forEach((t) => lines.push(taskLine(t)));
  }

  // Stats
  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  lines.push(`\n📊 完成率 ${pct}%  | 待处理${summary.todo}`);
  lines.push(`\n${pick(EVENING_CLOSINGS)}`);

  return { title: `【工作总结】${dateStr}`, content: lines.join('\n') };
}
