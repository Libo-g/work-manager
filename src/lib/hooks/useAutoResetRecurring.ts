'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task, RecurrenceType } from '@/lib/types';
import { addMonths } from 'date-fns';

const supabase = createClient();

const INTERVAL_MAP: Record<RecurrenceType, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
};

export function useAutoResetRecurring(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const runReset = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .not('recurrence_type', 'is', null)
        .not('next_due_date', 'is', null)
        .lte('next_due_date', new Date().toISOString());

      if (error || !data?.length) return;
      const tasks = data as Task[];

      for (const task of tasks) {
        const type = task.recurrence_type as RecurrenceType;
        const months = INTERVAL_MAP[type];

        // Insert history
        await supabase.from('task_completion_history').insert({
          task_id: task.id,
          completed_date: task.next_due_date,
          type: 'auto',
        });

        // Advance due date + reset status
        await supabase
          .from('tasks')
          .update({
            next_due_date: addMonths(new Date(task.next_due_date!), months).toISOString(),
            status: 'todo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
    };

    runReset();
  }, [userId, queryClient]);
}
