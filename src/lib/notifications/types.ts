export interface PushNotificationPayload {
  token: string;
  title: string;
  content: string;
}

export interface DailySummary {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

export interface PushResult {
  success: boolean;
  message: string;
}

export type PushType = 'morning' | 'evening';

export interface TaskWithProject {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  next_due_date: string | null;
  recurrence_type: string | null;
  projects: { name: string } | null;
}

export interface UserSettingsRow {
  user_id: string;
  pushplus_token: string;
  notifications_enabled: boolean;
}
