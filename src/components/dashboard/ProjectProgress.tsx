'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export function ProjectProgress() {
  const { user } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ['dashboard', 'progress'],
    queryFn: async () => {
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_archived', false);

      if (projErr || !projData) return [];

      const result = await Promise.all(
        projData.map(async (proj) => {
          const { count: total } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', proj.id);
          const { count: done } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', proj.id)
            .eq('status', 'done');

          return {
            id: proj.id,
            name: proj.name,
            color: proj.color,
            total: total ?? 0,
            done: done ?? 0,
          };
        })
      );

      return result;
    },
    enabled: !!user,
  });

  if (!projects?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">项目进度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((proj) => (
          <Link key={proj.id} href="/board" className="block">
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                <span className="text-zinc-700">{proj.name}</span>
              </div>
              <span className="text-zinc-400">
                {proj.done}/{proj.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: proj.total > 0 ? `${(proj.done / proj.total) * 100}%` : '0%',
                  backgroundColor: proj.color,
                }}
              />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
