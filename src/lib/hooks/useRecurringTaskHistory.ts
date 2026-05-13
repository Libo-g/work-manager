'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { CompletionHistoryEntry, RecurrenceType } from '@/lib/types';
import { addMonths } from 'date-fns';

const supabase = createClient();

export function useRecurringTaskHistory(taskId: string | undefined) {
  return useQuery({
    queryKey: ['task-history', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from('task_completion_history')
        .select('*')
        .eq('task_id', taskId)
        .order('completed_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as CompletionHistoryEntry[];
    },
    enabled: !!taskId,
  });
}

export function useCompleteRecurringTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { taskId: string; recurrenceType: RecurrenceType; nextDueDate: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Insert history record
      const { error: historyError } = await supabase
        .from('task_completion_history')
        .insert({
          task_id: input.taskId,
          completed_date: new Date().toISOString(),
          type: 'manual',
        });
      if (historyError) throw historyError;

      // Advance due date
      const monthsMap: Record<RecurrenceType, number> = {
        monthly: 1,
        quarterly: 3,
        semi_annual: 6,
        annual: 12,
      };
      const nextDue = addMonths(new Date(input.nextDueDate), monthsMap[input.recurrenceType]).toISOString();

      const { error: taskError } = await supabase
        .from('tasks')
        .update({ next_due_date: nextDue, status: 'todo', updated_at: new Date().toISOString() })
        .eq('id', input.taskId);
      if (taskError) throw taskError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['task-history', variables.taskId] });
    },
  });
}
