'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTags, useCreateTag, useDeleteTag } from '@/lib/hooks/useTags';
import { showSuccess, showError } from '@/components/shared/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const TAG_COLORS = ['#6B7280', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function TagManager() {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTag.mutateAsync({
        name: newName.trim(),
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      });
      setNewName('');
      showSuccess('标签已创建');
    } catch {
      showError('创建失败');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTag.mutateAsync(id);
      showSuccess('已删除');
    } catch {
      showError('删除失败');
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">标签管理</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="新标签名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="icon" onClick={handleCreate} disabled={createTag.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags?.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              style={{ borderColor: t.color, color: t.color }}
            >
              {t.name}
              <button onClick={() => handleDelete(t.id)} className="hover:opacity-70">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
