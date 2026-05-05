import { AppLayout } from '@/components/layout/AppLayout';
import { TodaySummary } from '@/components/dashboard/TodaySummary';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import { QuickAdd } from '@/components/dashboard/QuickAdd';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">仪表盘</h2>
        <QuickAdd />
      </div>
      <div className="space-y-6">
        <TodaySummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines />
          <ProjectProgress />
        </div>
      </div>
    </AppLayout>
  );
}
