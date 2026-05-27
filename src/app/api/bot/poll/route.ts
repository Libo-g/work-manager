import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { pollUpdates, sendReply } from '@/lib/bot/ilink';
import { parseTaskCommand } from '@/lib/bot/message-parser';

const HELP_TEXT =
  '发送「新建 任务标题」创建任务\n' +
  '支持：新建 [优先级] 标题 [截止X月X日] [待处理/进行中]\n' +
  '优先级：紧急/高/中/低（默认中）\n' +
  '示例：新建 紧急 修复登录 明天 进行中';

export async function GET() {
  const token = process.env.ILINK_BOT_TOKEN;
  const supabase = createServiceClient();

  // Load config from DB
  const { data: config } = await supabase
    .from('user_settings')
    .select('id, bot_cursor, ilink_token')
    .limit(1)
    .maybeSingle();

  const row = config as { id?: string; bot_cursor?: string; ilink_token?: string } | null;
  const ilinkToken = token || row?.ilink_token || '';
  if (!ilinkToken) {
    return NextResponse.json({ success: false, message: 'iLink token 未配置' });
  }

  const cursor = row?.bot_cursor ?? '';

  const { messages, newCursor } = await pollUpdates(ilinkToken, cursor);

  // Save cursor and bot user info back
  if (row?.id) {
    const updates: Record<string, string> = {};
    if (newCursor !== cursor) updates.bot_cursor = newCursor;
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      updates.bot_user_id = last.toUserId;
      updates.bot_context_token = last.contextToken;
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from('user_settings').update(updates).eq('id', row.id);
    }
  }

  const results: string[] = [];

  for (const msg of messages) {
    const parsed = parseTaskCommand(msg.text);

    if (!parsed) {
      await sendReply(ilinkToken, msg.toUserId, msg.contextToken, HELP_TEXT);
      results.push('help');
      continue;
    }

    // Get user from user_settings to create task under their account
    const { data: settings } = await supabase
      .from('user_settings')
      .select('user_id')
      .limit(1)
      .maybeSingle();

    if (!settings) {
      await sendReply(ilinkToken, msg.toUserId, msg.contextToken, '创建失败：未找到用户');
      results.push('no-user');
      continue;
    }

    const userId = (settings as { user_id: string }).user_id;

    // Find first active project, or create a default one
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .limit(1);

    let projectId: string;

    if (!projects || projects.length === 0) {
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: '默认项目',
          color: '#3B82F6',
        })
        .select()
        .single();

      if (!newProject) {
        await sendReply(ilinkToken, msg.toUserId, msg.contextToken, '创建失败：无法创建默认项目');
        results.push('no-project');
        continue;
      }
      projectId = newProject.id;
    } else {
      projectId = projects[0].id;
    }

    // Count existing tasks for position
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { error } = await supabase.from('tasks').insert({
      project_id: projectId,
      user_id: userId,
      title: parsed.title,
      priority: parsed.priority,
      status: parsed.status,
      due_date: parsed.dueDate,
      position: (count ?? 0) * 1000,
    });

    if (error) {
      await sendReply(ilinkToken, msg.toUserId, msg.contextToken, `创建失败：${error.message}`);
      results.push('error');
    } else {
      const priorityLabels: Record<string, string> = { urgent: '紧急', high: '高', medium: '中', low: '低' };
      const statusLabels: Record<string, string> = { todo: '待处理', in_progress: '进行中' };
      const details = [
        `[${priorityLabels[parsed.priority]}]`,
        parsed.title,
        parsed.dueDate ? `截止 ${parsed.dueDate}` : '',
        statusLabels[parsed.status],
      ].filter(Boolean).join(' ');
      await sendReply(ilinkToken, msg.toUserId, msg.contextToken, `已创建：${details}`);
      results.push('ok');
    }
  }

  return NextResponse.json({ success: true, messages, results });
}
