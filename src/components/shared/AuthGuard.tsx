'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && window.location.pathname !== '/auth/login') {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/auth/login';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  if (!user && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
