import { Suspense } from 'react';
import { BoardContent } from './BoardContent';

export default function BoardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    }>
      <BoardContent />
    </Suspense>
  );
}
