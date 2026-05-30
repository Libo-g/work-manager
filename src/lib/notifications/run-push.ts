import { createServiceClient } from '@/lib/supabase/service';
import { sendPushPlus } from './pushplus';
import { sendReply } from '@/lib/bot/ilink';
import {
  getActiveUsers,
  getOverdueTasks,
  getUpcomingTasks,
  getDailySummary,
  getDoneTasks,
  getInProgressInWeek,
  getInProgressTasks,
  getTodoTasks,
} from './queries';
import { composeMorningReport, composeAfternoonReport, composeEveningReport } from './composer';
import type { PushResult, PushType, UserSettingsRow } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

async function sendViaILink(
  user: UserSettingsRow,
  title: string,
  content: string
): Promise<PushResult> {
  if (!user.bot_user_id || !user.bot_context_token) {
    return { success: false, message: 'iLink bot 信息不完整' };
  }

  const token = user.ilink_token || process.env.ILINK_BOT_TOKEN || '';
  if (!token) {
    return { success: false, message: 'iLink token 未配置' };
  }

  const text = `${title}\n\n${content}`;
  const ok = await sendReply(token, user.bot_user_id, user.bot_context_token, text);
  return ok
    ? { success: true, message: 'iLink 发送成功' }
    : { success: false, message: 'iLink 发送失败' };
}

function sendViaPushPlus(
  user: UserSettingsRow,
  title: string,
  content: string
): Promise<PushResult> {
  if (!user.pushplus_token) {
    return Promise.resolve({ success: false, message: 'PushPlus token 未配置' });
  }
  return sendPushPlus(user.pushplus_token, title, content);
}

async function pushMessage(
  user: UserSettingsRow,
  title: string,
  content: string
): Promise<PushResult> {
  // 优先 iLink bot
  const iLinkResult = await sendViaILink(user, title, content);
  if (iLinkResult.success) return iLinkResult;

  // fallback PushPlus
  console.log(`iLink 推送失败 (${iLinkResult.message})，fallback 到 PushPlus`);
  return sendViaPushPlus(user, title, content);
}

async function sendMorningPush(
  supabase: SupabaseClient,
  user: UserSettingsRow
): Promise<PushResult> {
  const [overdue, upcoming, summary, inProgressWeek] = await Promise.all([
    getOverdueTasks(supabase, user.user_id),
    getUpcomingTasks(supabase, user.user_id),
    getDailySummary(supabase, user.user_id),
    getInProgressInWeek(supabase, user.user_id),
  ]);

  const { title, content } = composeMorningReport(summary, overdue, upcoming, inProgressWeek);
  return pushMessage(user, title, content);
}

async function sendEveningPush(
  supabase: SupabaseClient,
  user: UserSettingsRow
): Promise<PushResult> {
  const [summary, overdue, doneTasks, inProgressTasks, todoTasks] = await Promise.all([
    getDailySummary(supabase, user.user_id),
    getOverdueTasks(supabase, user.user_id),
    getDoneTasks(supabase, user.user_id),
    getInProgressTasks(supabase, user.user_id),
    getTodoTasks(supabase, user.user_id),
  ]);

  const { title, content } = composeEveningReport(
    summary, overdue, doneTasks, inProgressTasks, todoTasks
  );
  return pushMessage(user, title, content);
}

async function sendAfternoonPush(
  supabase: SupabaseClient,
  user: UserSettingsRow
): Promise<PushResult> {
  const [summary, overdue, inProgressTasks, todoTasks] = await Promise.all([
    getDailySummary(supabase, user.user_id),
    getOverdueTasks(supabase, user.user_id),
    getInProgressTasks(supabase, user.user_id),
    getTodoTasks(supabase, user.user_id),
  ]);

  const { title, content } = composeAfternoonReport(summary, overdue, inProgressTasks, todoTasks);
  return pushMessage(user, title, content);
}

export async function runPushNotifications(type: PushType): Promise<PushResult[]> {
  const supabase = createServiceClient();

  const users = await getActiveUsers(supabase);
  if (users.length === 0) {
    return [{ success: false, message: '无活跃推送用户' }];
  }

  const results: PushResult[] = [];

  for (const user of users) {
    const result =
      type === 'morning'
        ? await sendMorningPush(supabase, user)
        : type === 'afternoon'
          ? await sendAfternoonPush(supabase, user)
          : await sendEveningPush(supabase, user);
    results.push(result);
  }

  return results;
}
