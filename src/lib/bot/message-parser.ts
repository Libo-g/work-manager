import type { TaskPriority, TaskStatus } from '@/lib/types';

interface ParsedTask {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

const PRIORITY_MAP: Record<string, TaskPriority> = {
  '紧急': 'urgent', '高': 'high', '中': 'medium', '低': 'low',
};

const STATUS_MAP: Record<string, TaskStatus> = {
  '进行中': 'in_progress', '待处理': 'todo',
};

export function parseTaskCommand(input: string): ParsedTask | null {
  if (!input.startsWith('新建') && !input.startsWith('创建') && !input.startsWith('todo')) {
    return null;
  }

  let text = input
    .replace(/^(新建|创建|todo)\s*/i, '')
    .trim();

  if (!text) return null;

  let priority: TaskPriority = 'medium';
  let status: TaskStatus = 'todo';
  let dueDate: string | null = null;
  let title = text;

  // Extract priority
  for (const [label, p] of Object.entries(PRIORITY_MAP)) {
    if (text.startsWith(label)) {
      priority = p;
      title = text.slice(label.length).trim();
      break;
    }
  }

  // Extract due date: X月X日
  const dateMatch = title.match(/截止\s*(\d{1,2})月(\d{1,2})日?/);
  if (dateMatch) {
    const month = String(parseInt(dateMatch[1])).padStart(2, '0');
    const day = String(parseInt(dateMatch[2])).padStart(2, '0');
    const year = new Date().getFullYear();
    dueDate = `${year}-${month}-${day}`;
    title = title.replace(dateMatch[0], '').trim();
  }

  // Extract relative dates
  const now = new Date();
  if (title.includes('今天')) {
    dueDate = now.toISOString().split('T')[0];
    title = title.replace(/今天/g, '').trim();
  } else if (title.includes('明天')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate = tomorrow.toISOString().split('T')[0];
    title = title.replace(/明天/g, '').trim();
  } else if (title.includes('后天')) {
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dueDate = dayAfter.toISOString().split('T')[0];
    title = title.replace(/后天/g, '').trim();
  }

  // Extract status
  for (const [label, s] of Object.entries(STATUS_MAP)) {
    if (title.includes(label)) {
      status = s;
      title = title.replace(label, '').trim();
      break;
    }
  }

  if (!title) return null;

  return { title, priority, status, dueDate };
}
