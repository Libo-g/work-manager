import { NextRequest, NextResponse } from 'next/server';
import { runPushNotifications } from '@/lib/notifications/run-push';
import type { PushType } from '@/lib/notifications/types';

export async function GET(request: NextRequest) {
  const type = (request.nextUrl.searchParams.get('type') ?? 'morning') as PushType;

  if (type !== 'morning' && type !== 'afternoon' && type !== 'evening') {
    return NextResponse.json(
      { success: false, message: 'type 参数必须为 morning / afternoon / evening' },
      { status: 400 }
    );
  }

  const results = await runPushNotifications(type);
  return NextResponse.json(results);
}
