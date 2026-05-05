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
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
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

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!loading && !user && pathname !== '/auth/login' && !pathname.startsWith('/auth/')) {
      router.replace('/auth/login');
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/auth/login');
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  // On login page, render children directly
  if (!user && (pathname === '/auth/login' || pathname.startsWith('/auth/'))) {
    return <>{children}</>;
  }

  // Not authenticated and not on login page — show nothing (redirect will happen)
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
