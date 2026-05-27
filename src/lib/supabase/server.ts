import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import './ws-polyfill';

export async function createClient() {
  const cookieStore = await cookies();

  const url = 'https://gtmhnkalwlstkrxxutxv.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bWhua2Fsd2xzdGtyeHh1dHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjI1MjYsImV4cCI6MjA5MzUzODUyNn0.C4h3FZOVVpRTU53mrndM86TK8yIpefL-N5ekT3KxN-A';

  return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
