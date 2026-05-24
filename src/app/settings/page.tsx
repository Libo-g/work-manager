import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectManager } from '@/components/settings/ProjectManager';
import { TagManager } from '@/components/settings/TagManager';
import { DataExport } from '@/components/settings/DataExport';
import { PushNotification } from '@/components/settings/PushNotification';

export default function SettingsPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">设置</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectManager />
        <TagManager />
      </div>
      <div className="mt-6">
        <PushNotification />
      </div>
      <div className="mt-6">
        <DataExport />
      </div>
    </AppLayout>
  );
}
