'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';

interface ChartFiltersProps {
  selectedProject: string;
  onProjectChange: (id: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function ChartFilters({
  selectedProject,
  onProjectChange,
  timeRange,
  onTimeRangeChange,
}: ChartFiltersProps) {
  const { data: projects } = useProjects();

  const projectName = selectedProject === 'all'
    ? '全部项目'
    : projects?.find((p) => p.id === selectedProject)?.name ?? selectedProject;

  const timeLabel: Record<string, string> = {
    '7': '最近 7 天', '30': '最近 30 天', '90': '最近 90 天', 'all': '全部',
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <Select value={selectedProject} onValueChange={(v) => v && onProjectChange(v)}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="全部项目">{projectName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部项目</SelectItem>
          {projects?.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={timeRange} onValueChange={(v) => v && onTimeRangeChange(v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="时间范围">{timeLabel[timeRange] ?? timeRange}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">最近 7 天</SelectItem>
          <SelectItem value="30">最近 30 天</SelectItem>
          <SelectItem value="90">最近 90 天</SelectItem>
          <SelectItem value="all">全部</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
