'use client';

import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://gtmhnkalwlstkrxxutxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bWhua2Fsd2xzdGtyeHh1dHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjI1MjYsImV4cCI6MjA5MzUzODUyNn0.C4h3FZOVVpRTU53mrndM86TK8yIpefL-N5ekT3KxN-A';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
