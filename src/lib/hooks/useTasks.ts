'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus } from '@/lib/types';

const supabase = createClient();

export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: ['tasks', projectId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      query = query.order('position', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      project_id: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: string;
      due_date?: string;
      position?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      project_id?: string;
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: string;
      due_date?: string | null;
      position?: number;
    }) => {
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
