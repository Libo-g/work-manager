'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { showSuccess, showError } from '@/components/shared/Toast';

export function DataExport() {
  async function handleExport(format: 'json' | 'csv') {
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('导出成功');
    } catch {
      showError('导出失败');
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">数据导出</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-500">将所有任务和项目数据导出为文件</p>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4" />
            导出 JSON
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4" />
            导出 CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
