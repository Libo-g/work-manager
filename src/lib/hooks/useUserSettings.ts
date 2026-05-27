'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { UserSettings } from '@/lib/types';

const supabase = createClient();

export function useUserSettings() {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return (data as UserSettings | null) ?? null;
    },
  });
}

export function useUpsertUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      pushplus_token?: string;
      notifications_enabled?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(
          { ...input, user_id: user.id },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
}
