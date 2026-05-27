import { sendReply } from '@/lib/bot/ilink';
import type { PushResult } from './types';

export async function sendIlinkPush(
  token: string,
  toUserId: string,
  contextToken: string,
  content: string
): Promise<PushResult> {
  try {
    const ok = await sendReply(token, toUserId, contextToken, content);
    return ok
      ? { success: true, message: 'ok' }
      : { success: false, message: 'iLink send returned error' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
