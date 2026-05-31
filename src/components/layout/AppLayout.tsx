'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/providers/AuthProvider';
import { useAutoResetRecurring } from '@/lib/hooks/useAutoResetRecurring';
import { useState, type ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  useAutoResetRecurring(user?.id);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Top banner — full width */}
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Main area: sidebar + content, below banner */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile sidebar sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-56 p-0 dark:bg-zinc-900">
            <Sidebar collapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
