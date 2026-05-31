import type { PushResult } from './types';

const PUSHPLUS_URL = 'https://www.pushplus.plus/send';

export async function sendPushPlus(token: string, title: string, content: string): Promise<PushResult> {
  try {
    const res = await fetch(PUSHPLUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        title,
        content,
        channel: 'clawbot',
        template: 'txt',
      }),
    });

    const json = await res.json();
    console.log('[PushPlus] response:', JSON.stringify(json));
    return { success: json.code === 200, message: json.msg ?? 'unknown' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
