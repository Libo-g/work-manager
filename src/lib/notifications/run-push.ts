import { createServiceClient } from '@/lib/supabase/service';
import { sendPushPlus } from './pushplus';
import {
  getUserSettings,
  getOverdueTasks,
  getUpcomingTasks,
  getDailySummary,
  getDoneTasks,
  getInProgressInWeek,
} from './queries';
import { composeMorningReport, composeEveningReport } from './composer';
import type { PushResult, PushType } from './types';

export async function runPushNotifications(type: PushType): Promise<PushResult[]> {
  const supabase = createServiceClient();

  const settings = await getUserSettings(supabase);
  if (!settings?.pushplus_token || !settings.notifications_enabled) {
    return [{ success: false, message: '推送未启用或未配置 token' }];
  }

  const userId = settings.user_id;
  const token = settings.pushplus_token;

  if (type === 'morning') {
    const [overdue, upcoming, summary, inProgressWeek] = await Promise.all([
      getOverdueTasks(supabase, userId),
      getUpcomingTasks(supabase, userId),
      getDailySummary(supabase, userId),
      getInProgressInWeek(supabase, userId),
    ]);

    const { title, content } = composeMorningReport(summary, overdue, upcoming, inProgressWeek);
    const result = await sendPushPlus({ token, title, content });
    return [result];
  }

  if (type === 'evening') {
    const [summary, overdue, doneTasks] = await Promise.all([
      getDailySummary(supabase, userId),
      getOverdueTasks(supabase, userId),
      getDoneTasks(supabase, userId),
    ]);

    const { data: inProgressTasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, project_id, projects(name)')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('due_date', { ascending: true });

    const { data: todoTasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, project_id, projects(name)')
      .eq('user_id', userId)
      .eq('status', 'todo')
      .order('due_date', { ascending: true });

    const { title, content } = composeEveningReport(
      summary,
      overdue,
      doneTasks,
      (inProgressTasks ?? []) as unknown as import('./types').TaskWithProject[],
      (todoTasks ?? []) as unknown as import('./types').TaskWithProject[]
    );

    const result = await sendPushPlus({ token, title, content });
    return [result];
  }

  return [{ success: false, message: `未知推送类型: ${type}` }];
}
