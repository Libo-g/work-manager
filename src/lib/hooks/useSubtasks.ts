'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';

const supabase = createClient();

export function useSubtasks(parentId: string | undefined) {
  return useQuery({
    queryKey: ['subtasks', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', parentId)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Task[];
    },
    enabled: !!parentId,
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { parent_id: string; title: string; project_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          parent_id: input.parent_id,
          project_id: input.project_id,
          title: input.title,
          status: 'todo',
          user_id: user.id,
          position: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; title?: string; status?: string; parent_id: string }) => {
      const { id, parent_id, ...fields } = input;
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
