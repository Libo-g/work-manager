import type { DailySummary, TaskWithProject } from './types';

function todayString(): string {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_ICON: Record<string, string> = {
  urgent: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '⚪',
};

function sortByPriority(tasks: TaskWithProject[]): TaskWithProject[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 2;
    const pb = PRIORITY_ORDER[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });
}

function taskLine(task: TaskWithProject, extra?: string): string {
  const project = task.projects?.name ?? '未分类';
  const icon = PRIORITY_ICON[task.priority] ?? '🟡';
  const suffix = extra ? ` (${extra})` : '';
  return `${icon} [${project}] ${task.title}${suffix}`;
}

const MORNING_GREETINGS = [
  '早上好！先看看今天的任务安排吧 ☀️',
  '早安！一日之计在于晨，来看看任务清单 🌅',
  '早上好！准备好迎接新一天的挑战了吗 🌤️',
];

const AFTERNOON_GREETINGS = [
  '下午好！来看看任务推进得怎么样了 📋',
  '午后来个进度检查 🔍',
  '下午过半，盘点一下任务进度吧 ☕',
];

const EVENING_GREETINGS = [
  '下班啦！来看看今天的工作成果 🎉',
  '收工！回顾一下今天的工作 🏠',
  '一天结束了，来做个总结 📋',
];

const MORNING_CLOSINGS = [
  '加油，今天也要高效完成任务 💪',
  '合理安排，从容应对 ✨',
  '心中有数，脚下有路 🚀',
];

const AFTERNOON_CLOSINGS = [
  '还有半天，抓紧冲刺 💪',
  '该补的补，该赶的赶 ✨',
];

const EVENING_CLOSINGS = [
  '辛苦啦，明天继续加油 💼',
  '好好休息，明天见 🌙',
  '放下工作，享受下班时光吧 🍵',
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Morning ---

export function composeMorningReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  _upcoming: TaskWithProject[],
  inProgressWeek: TaskWithProject[],
  todoWeek: TaskWithProject[]
): { title: string; content: string } {
  const lines: string[] = [];
  const dateStr = todayString();

  lines.push(pick(MORNING_GREETINGS));

  const upcoming = sortByPriority([...inProgressWeek, ...todoWeek]);
  if (upcoming.length > 0) {
    lines.push(`\n📌 待办 (${upcoming.length})`);
    upcoming.forEach((t) => {
      if (t.due_date) {
        const d = daysUntil(t.due_date);
        const label = d <= 0 ? '今日到期' : `还剩${d}天`;
        lines.push(taskLine(t, label));
      } else {
        lines.push(taskLine(t));
      }
    });
  }

  if (overdue.length > 0) {
    const sorted = sortByPriority(overdue);
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    sorted.forEach((t) => {
      const d = t.due_date ? daysUntil(t.due_date) : 0;
      const label = d < 0 ? `逾期${Math.abs(d)}天` : '逾期';
      lines.push(taskLine(t, label));
    });
  }

  if (upcoming.length === 0 && overdue.length === 0) {
    lines.push('\n✨ 暂无待办或逾期任务，继续保持！');
  }

  lines.push(`\n📊 共${summary.total}项 | 进行中${summary.inProgress} | 待处理${summary.todo}`);
  lines.push(`\n${pick(MORNING_CLOSINGS)}`);

  return { title: `【任务提醒】${dateStr}`, content: lines.join('\n') };
}

// --- Afternoon ---

export function composeAfternoonReport(
  summary: DailySummary,
  overdue: TaskWithProject[],
  inProgressTasks: TaskWithProject[],
  todoTasks: TaskWithProject[]
): { title: string; content: string } {
  const lines: string[] = [];
  const dateStr = todayString();

  lines.push(pick(AFTERNOON_GREETINGS));

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekLater = new Date(now);
  weekLater.setDate(weekLater.getDate() + 7);

  const upcoming = sortByPriority(
    [...inProgressTasks, ...todoTasks].filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d >= now && d <= weekLater;
    })
  );

  if (upcoming.length > 0) {
    lines.push(`\n📌 待办 (${upcoming.length})`);
    upcoming.slice(0, 10).forEach((t) => {
      if (t.due_date) {
        const d = daysUntil(t.due_date);
        const label = d <= 0 ? '今日到期' : `还剩${d}天`;
        lines.push(taskLine(t, label));
      } else {
        lines.push(taskLine(t));
      }
    });
  }

  if (overdue.length > 0) {
    const sorted = sortByPriority(overdue);
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    sorted.slice(0, 5).forEach((t) => {
      const d = t.due_date ? daysUntil(t.due_date) : 0;
      const label = d < 0 ? `逾期${Math.abs(d)}天` : '逾期';
      lines.push(taskLine(t, label));
    });
  }

  if (upcoming.length === 0 && overdue.length === 0) {
    lines.push('\n✨ 暂无待办或逾期任务');
  }

  lines.push(`\n📊 共${summary.total}项 | 已完成${summary.done} | 进行中${summary.inProgress} | 待处理${summary.todo}`);
  lines.push(`\n${pick(AFTERNOON_CLOSINGS)}`);

  return { title: `【下午进度】${dateStr}`, content: lines.join('\n') };
}

// --- Evening ---

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

  if (doneTasks.length > 0) {
    lines.push(`\n✅ 今日完成 (${doneTasks.length})`);
    doneTasks.slice(0, 5).forEach((t) => lines.push(taskLine(t)));
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekLater = new Date(now);
  weekLater.setDate(weekLater.getDate() + 7);

  const upcoming = sortByPriority(
    [...inProgressTasks, ...todoTasks].filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d >= now && d <= weekLater;
    })
  );

  if (upcoming.length > 0) {
    lines.push(`\n📌 待办 (${upcoming.length})`);
    upcoming.slice(0, 5).forEach((t) => {
      if (t.due_date) {
        const d = daysUntil(t.due_date);
        const label = d <= 0 ? '今日到期' : `还剩${d}天`;
        lines.push(taskLine(t, label));
      } else {
        lines.push(taskLine(t));
      }
    });
  }

  if (overdue.length > 0) {
    const sorted = sortByPriority(overdue);
    lines.push(`\n⚠️ 逾期 (${overdue.length})`);
    sorted.slice(0, 3).forEach((t) => {
      const d = t.due_date ? daysUntil(t.due_date) : 0;
      const label = d < 0 ? `逾期${Math.abs(d)}天` : '逾期';
      lines.push(taskLine(t, label));
    });
  }

  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;
  lines.push(`\n📊 完成率${pct}% | 待处理${summary.todo}`);
  lines.push(`\n${pick(EVENING_CLOSINGS)}`);

  return { title: `【工作总结】${dateStr}`, content: lines.join('\n') };
}
