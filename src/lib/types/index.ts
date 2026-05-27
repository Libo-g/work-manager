export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RecurrenceType = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  monthly: '月度',
  quarterly: '季度',
  semi_annual: '半年',
  annual: '年度',
};

export const RECURRENCE_REMINDER_DAYS: Record<RecurrenceType, number> = {
  monthly: 3,
  quarterly: 7,
  semi_annual: 10,
  annual: 15,
};

export interface Project {
  id: string;
  name: string;
  color: string;
  is_archived: boolean;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  parent_id: string | null;
  recurrence_type: RecurrenceType | null;
  next_due_date: string | null;
  recurrence_start: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  subtasks?: Task[];
}

export interface CompletionHistoryEntry {
  id: string;
  task_id: string;
  completed_date: string;
  type: 'manual' | 'auto';
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待处理',
  in_progress: '进行中',
  done: '已完成',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

export interface UserSettings {
  id: string;
  user_id: string;
  pushplus_token: string;
  ilink_token: string;
  bot_user_id: string;
  bot_context_token: string;
  notifications_enabled: boolean;
  bot_cursor: string;
  created_at: string;
  updated_at: string;
}
