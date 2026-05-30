import type { SupabaseClient } from '@supabase/supabase-js';
import type { DailySummary, UserSettingsRow, TaskWithProject } from './types';
import { RECURRENCE_REMINDER_DAYS, type RecurrenceType } from '@/lib/types';

export async function getActiveUsers(
  supabase: SupabaseClient
): Promise<UserSettingsRow[]> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, pushplus_token, notifications_enabled');

  if (error || !data) return [];
  return (data as UserSettingsRow[]).filter(
    (row) => row.notifications_enabled && row.pushplus_token
  );
}

export async function getOverdueTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .neq('status', 'done')
    .not('due_date', 'is', null)
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getUpcomingTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

  const { data: oneShot, error: e1 } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .neq('status', 'done')
    .is('recurrence_type', null)
    .not('due_date', 'is', null)
    .gte('due_date', todayStr)
    .lte('due_date', sevenDaysStr)
    .order('due_date', { ascending: true });

  const { data: recurring, error: e2 } = await supabase
    .from('tasks')
    .select(
      'id, title, status, priority, due_date, next_due_date, recurrence_type, project_id, projects(name)'
    )
    .eq('user_id', userId)
    .neq('status', 'done')
    .not('recurrence_type', 'is', null)
    .not('next_due_date', 'is', null)
    .order('next_due_date', { ascending: true });

  const oneShotTasks = ((oneShot ?? []) as unknown as TaskWithProject[]);
  const recurringFiltered = ((recurring ?? []) as unknown as TaskWithProject[]).filter((task) => {
    const type = task.recurrence_type as RecurrenceType;
    const days = RECURRENCE_REMINDER_DAYS[type];
    if (!days || !task.next_due_date) return false;
    const nextDue = new Date(task.next_due_date);
    const start = new Date(nextDue);
    start.setDate(start.getDate() - days);
    return today >= start && today < nextDue;
  });

  return [...oneShotTasks, ...recurringFiltered];
}

export async function getDailySummary(
  supabase: SupabaseClient,
  userId: string
): Promise<DailySummary> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('status, due_date')
    .eq('user_id', userId);

  if (error) return { total: 0, done: 0, inProgress: 0, todo: 0, overdue: 0 };

  const tasks = data ?? [];
  const todayStr = new Date().toISOString().split('T')[0];

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter(
    (t) => t.status === 'in_progress'
  ).length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && t.due_date && t.due_date < todayStr
  ).length;

  return { total, done, inProgress, todo, overdue };
}

export async function getInProgressInWeek(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .not('due_date', 'is', null)
    .gte('due_date', todayStr)
    .lte('due_date', sevenDaysStr)
    .order('due_date', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getUpcomingWeekTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .in('status', ['in_progress', 'todo'])
    .not('due_date', 'is', null)
    .gte('due_date', todayStr)
    .lte('due_date', sevenDaysStr)
    .order('due_date', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getDoneTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .eq('status', 'done')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getInProgressTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('due_date', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getTodoTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<TaskWithProject[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id, projects(name)')
    .eq('user_id', userId)
    .eq('status', 'todo')
    .order('due_date', { ascending: true });

  if (error) return [];
  return (data ?? []) as unknown as TaskWithProject[];
}
