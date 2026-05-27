import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { pollUpdates } from '@/lib/bot/ilink';
import { parseTaskCommand } from '@/lib/bot/message-parser';

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
    results.push(parsed ? `task:${parsed.title}` : `msg:${msg.text}`);
  }

  console.log('Bot poll:', JSON.stringify({ results, bot_user_id: row?.id ? 'saved' : 'none' }));

  return NextResponse.json({ success: true, messages: results, results });
}
