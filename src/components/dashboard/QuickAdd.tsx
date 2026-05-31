'use client';

import { CreateTaskDialog } from '@/components/shared/CreateTaskDialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export function QuickAdd() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        <Plus className="h-4 w-4" />
        新建任务
      </button>
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
