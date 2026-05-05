'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ERROR_ZH: Record<string, string> = {
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '邮箱未验证，请先验证邮箱',
  'User already registered': '该邮箱已注册，请直接登录',
  'Password should be at least 6 characters': '密码至少需要 6 位',
};

function toZh(err: string): string {
  for (const [en, zh] of Object.entries(ERROR_ZH)) {
    if (err.includes(en)) return zh;
  }
  return `操作失败：${err}`;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(toZh(err.message));
          setLoading(false);
          return;
        }
        router.push('/');
      } else {
        const { error: err2 } = await supabase.auth.signUp({ email, password });
        if (err2) {
          setError(toZh(err2.message));
          setLoading(false);
          return;
        }
        setIsLogin(true);
        setError('注册成功！请重新输入密码登录');
      }
    } catch {
      setError('网络错误，请重试');
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">工作任务管理</CardTitle>
          <CardDescription>
            {isLogin ? '登录你的账号' : '创建新账号'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位密码"
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className={`text-sm ${error.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
            >
              {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
