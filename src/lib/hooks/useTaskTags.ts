'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useTaskTags(taskId: string | undefined) {
  return useQuery({
    queryKey: ['taskTags', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from('task_tags')
        .select('tag_id')
        .eq('task_id', taskId);

      if (error) throw error;
      return (data ?? []).map((t: { tag_id: string }) => t.tag_id);
    },
    enabled: !!taskId,
  });
}

export function useSetTaskTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, tagIds }: { taskId: string; tagIds: string[] }) => {
      // Delete all existing tag associations
      const { error: delErr } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId);
      if (delErr) throw delErr;

      // Insert new associations
      if (tagIds.length > 0) {
        const rows = tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId }));
        const { error: insErr } = await supabase.from('task_tags').insert(rows);
        if (insErr) throw insErr;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskTags', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
