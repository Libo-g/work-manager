import { createClient } from '@supabase/supabase-js';
import './ws-polyfill';

export function createServiceClient() {
  const url = 'https://gtmhnkalwlstkrxxutxv.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(url, key);
}
