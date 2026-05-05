'use client';

import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if not authenticated (skip on auth pages)
  useEffect(() => {
    if (mounted && !loading && !user && pathname !== '/auth/login') {
      router.replace('/auth/login');
    }
  }, [mounted, user, loading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/auth/login');
  };

  // During SSR (before mount), render children to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  // On login page, always render
  if (pathname === '/auth/login') {
    return (
      <AuthContext.Provider value={{ user, loading, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Not authenticated on protected page
  if (!user) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
