import type { PushNotificationPayload, PushResult } from './types';

const PUSHPLUS_URL = 'http://www.pushplus.plus/send';

export async function sendPushPlus(payload: PushNotificationPayload): Promise<PushResult> {
  try {
    const res = await fetch(PUSHPLUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: payload.token,
        title: payload.title,
        content: payload.content,
        channel: 'clawbot',
        template: 'txt',
      }),
    });

    const json = await res.json();
    return { success: json.code === 200, message: json.msg ?? 'unknown' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
