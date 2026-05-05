'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects, useCreateProject, useDeleteProject } from '@/lib/hooks/useProjects';
import { showSuccess, showError } from '@/components/shared/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function ProjectManager() {
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createProject.mutateAsync({
        name: newName.trim(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      setNewName('');
      showSuccess('项目已创建');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      showError(`创建失败：${msg}`);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('确定删除此项目？所有关联任务将被删除。')) return;
    try {
      await deleteProject.mutateAsync(id);
      showSuccess('已删除');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      showError(`删除失败：${msg}`);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">项目管理</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="新项目名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="icon" onClick={handleCreate} disabled={createProject.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {projects?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm">{p.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
