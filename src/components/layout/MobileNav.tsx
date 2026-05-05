'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Kanban, PieChart, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/board', label: '看板', icon: Kanban },
  { href: '/charts', label: '图表', icon: PieChart },
  { href: '/settings', label: '设置', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
