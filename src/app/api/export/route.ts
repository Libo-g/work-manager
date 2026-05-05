import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'json';
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id);

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);

  if (format === 'csv') {
    const headers = 'id,title,description,status,priority,due_date,project_id,created_at\n';
    const rows = (tasks ?? []).map((t) =>
      `"${t.id}","${t.title}","${t.description ?? ''}","${t.status}","${t.priority}","${t.due_date ?? ''}","${t.project_id}","${t.created_at}"`
    ).join('\n');
    return new NextResponse(headers + rows, {
      headers: { 'Content-Type': 'text/csv' },
    });
  }

  return NextResponse.json({ tasks, projects });
}
