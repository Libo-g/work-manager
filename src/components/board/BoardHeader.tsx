'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/lib/hooks/useProjects';
import { Search } from 'lucide-react';
import type { TaskPriority } from '@/lib/types';

interface BoardHeaderProps {
  selectedProject: string | null;
  onProjectChange: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityChange: (priority: TaskPriority | 'all') => void;
}

export function BoardHeader({
  selectedProject,
  onProjectChange,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
}: BoardHeaderProps) {
  const { data: projects, isLoading } = useProjects();

  const selectedName = selectedProject
    ? projects?.find((p) => p.id === selectedProject)?.name ?? selectedProject
    : '全部项目';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <Select value={selectedProject ?? 'all'} onValueChange={(v) => onProjectChange(v === 'all' ? null : v)}>
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder={isLoading ? '加载中...' : '全部项目'}>
            {selectedName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部项目</SelectItem>
          {projects?.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="搜索任务..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={priorityFilter} onValueChange={(v) => v && onPriorityChange(v as TaskPriority | 'all')}>
        <SelectTrigger className="w-full sm:w-28">
          <SelectValue placeholder="优先级" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="urgent">紧急</SelectItem>
          <SelectItem value="high">高</SelectItem>
          <SelectItem value="medium">中</SelectItem>
          <SelectItem value="low">低</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
