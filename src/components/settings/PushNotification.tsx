'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/components/shared/Toast';
import { useUserSettings, useUpsertUserSettings } from '@/lib/hooks/useUserSettings';
import { Bell, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : '未知错误';
}

export function PushNotification() {
  const { data: settings } = useUserSettings();
  const upsertSettings = useUpsertUserSettings();
  const [ilinkToken, setIlinkToken] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (settings?.ilink_token) {
      setIlinkToken(settings.ilink_token);
    }
  }, [settings]);

  const enabled = settings?.notifications_enabled ?? true;

  async function handleSaveIlinkToken() {
    try {
      await upsertSettings.mutateAsync({ ilink_token: ilinkToken.trim() });
      showSuccess('iLink Token 已保存');
    } catch (e: unknown) {
      showError(`保存失败：${getErrorMessage(e)}`);
    }
  }

  async function handleToggleEnabled() {
    try {
      await upsertSettings.mutateAsync({ notifications_enabled: !enabled });
      showSuccess(enabled ? '推送已关闭' : '推送已开启');
    } catch (e: unknown) {
      showError(`操作失败：${getErrorMessage(e)}`);
    }
  }

  async function handleTestPush() {
    if (!ilinkToken.trim()) {
      showError('请先填写 iLink Bot Token');
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch('/api/cron/push?type=morning');
      const results = await res.json();
      if (results.length > 0 && results[0].success) {
        showSuccess('测试推送已发送，请查看微信');
      } else {
        showError(`发送失败：${results[0]?.message ?? '未知错误'}`);
      }
    } catch {
      showError('发送失败：网络错误');
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-500" />
          微信推送通知
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">
            iLink Bot Token
          </label>
          <p className="text-xs text-zinc-400 mb-2">
            在终端运行 node scripts/get-ilink-token.mjs 获取 token，用于微信收发消息
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="输入 iLink bot token"
              value={ilinkToken}
              onChange={(e) => setIlinkToken(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={handleSaveIlinkToken}
              disabled={upsertSettings.isPending}
            >
              保存
            </Button>
          </div>
          {settings?.bot_user_id && (
            <p className="text-xs text-green-600 mt-1">已绑定微信用户，可正常收发消息</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-700">启用推送通知</p>
            <p className="text-xs text-zinc-400">
              每天 8:15 任务提醒 / 17:20 工作总结
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-700">测试推送</p>
            <p className="text-xs text-zinc-400">
              发送一条早间提醒到微信，确认配置正确
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestPush}
            disabled={sendingTest}
          >
            <Send className="h-4 w-4 mr-1" />
            {sendingTest ? '发送中...' : '发送测试'}
          </Button>
        </div>

        <p className="text-xs text-zinc-400">
          iLink Bot 统一处理微信消息收发和定时推送。每 24 小时需在微信中主动发一条消息激活
        </p>
      </CardContent>
    </Card>
  );
}
