import type { DailySummary, TaskWithProject } from './types';
import { RECURRENCE_LABELS, type RecurrenceType } from '@/lib/types';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

function composeNarrative(
  summary: DailySummary,
  overdue: TaskWithProject[],
  doneTasks: TaskWithProject[]
): string {
  const parts: string[] = [];

  parts.push(`今日共完成 ${summary.done} 项任务`);

  if (doneTasks.length > 0) {
    const topDone = doneTasks.slice(0, 3).map((t) => t.title).join('、');
    parts.push(`主要完成了 ${topDone} 等`);
  }

  if (summary.inProgress > 0) {
    parts.push(`${summary.inProgress} 项任务仍在推进中`);
  }

  if (overdue.length > 0) {
    const topOverdue = overdue.slice(0, 2);
    const overdueDesc = topOverdue
      .map((t) => `${t.title}(已逾期${Math.abs(daysUntil(t.due_date!))}天)`)
      .join('、');
    parts.push(`其中 ${overdueDesc} 需优先处理`);
  }

  if (summary.todo > 0) {
    parts.push(`另有 ${summary.todo} 项任务尚未启动，建议明天重点关注`);
  }

  return parts.join('；') + '。';
}

export function composeMorningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  upcoming: TaskWithProject[],
  inProgressWeek: TaskWithProject[]
): { title: string; content: string } {
  const dateStr = todayString();
  const title = `【今日任务提醒】${dateStr}`;

  const lines: string[] = [];
  lines.push(pick(MORNING_GREETINGS));
  lines.push('');

  lines.push('📋 今日概览');
  lines.push(`总任务: ${summary.total}  已完成: ${summary.done}  进行中: ${summary.inProgress}  待处理: ${summary.todo}  已逾期: ${summary.overdue}`);
  lines.push('');

  if (overdue.length > 0) {
    lines.push(`⚠️ 逾期任务 (${overdue.length})`);
    for (const task of overdue) {
      const label = task.due_date ? ` - 截止 ${formatDate(task.due_date)}` : '';
      lines.push(taskLine(task) + label);
    }
    lines.push('');
  }

  if (inProgressWeek.length > 0) {
    lines.push(`🔥 进行中·7日内到期 (${inProgressWeek.length})`);
    for (const task of inProgressWeek) {
      if (task.due_date) {
        const remaining = daysUntil(task.due_date);
        const remainingText = remaining <= 0 ? '今日到期' : `还剩 ${remaining} 天`;
        lines.push(`${taskLine(task)} - 截止 ${formatDate(task.due_date)} (${remainingText})`);
      }
    }
    lines.push('');
  }

  if (upcoming.length > 0) {
    lines.push(`⏰ 即将到期 (${upcoming.length})`);
    for (const task of upcoming) {
      const dateField = task.next_due_date ?? task.due_date;
      if (dateField) {
        const remaining = daysUntil(dateField);
        const typeLabel = task.recurrence_type
          ? ` [${RECURRENCE_LABELS[task.recurrence_type as RecurrenceType]}]`
          : '';
        const remainingText = remaining <= 0 ? '今日到期' : `还剩 ${remaining} 天`;
        lines.push(`${taskLine(task)}${typeLabel} - 截止 ${formatDate(dateField)} (${remainingText})`);
      }
    }
    lines.push('');
  }

  if (overdue.length === 0 && upcoming.length === 0) {
    lines.push('✨ 暂无逾期或即将到期的任务，继续保持！');
    lines.push('');
  }

  lines.push(pick(MORNING_CLOSINGS));

  return { title, content: lines.join('\n') };
}

export function composeEveningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  doneTasks: TaskWithProject[],
  inProgressTasks: TaskWithProject[],
  todoTasks: TaskWithProject[]
): { title: string; content: string } {
  const dateStr = todayString();
  const title = `【今日工作总结】${dateStr}`;

  const lines: string[] = [];
  lines.push(pick(EVENING_GREETINGS));
  lines.push('');

  lines.push(composeNarrative(summary, overdue, doneTasks));
  lines.push('');
  lines.push('────────────────────');
  lines.push('');

  if (doneTasks.length > 0) {
    lines.push(`✅ 已完成 (${doneTasks.length})`);
    for (const task of doneTasks.slice(0, 5)) {
      lines.push(taskLine(task));
    }
    lines.push('');
  }

  if (inProgressTasks.length > 0) {
    lines.push(`📝 进行中 (${inProgressTasks.length})`);
    for (const task of inProgressTasks.slice(0, 5)) {
      const overdueMark = task.due_date && new Date(task.due_date) < new Date() ? ' - 已逾期 ⚠️' : '';
      lines.push(taskLine(task) + overdueMark);
    }
    if (inProgressTasks.length > 5) {
      lines.push(`... 还有 ${inProgressTasks.length - 5} 项`);
    }
    lines.push('');
  }

  if (todoTasks.length > 0) {
    lines.push(`⏳ 仍未开始 (${todoTasks.length})`);
  }

  const total = summary.total;
  const done = summary.done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  lines.push(`📊 完成率: ${done}/${total} (${pct}%)`);
  lines.push('');

  lines.push(pick(EVENING_CLOSINGS));

  return { title, content: lines.join('\n') };
}
