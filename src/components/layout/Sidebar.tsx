'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Kanban, PieChart, Settings, CalendarDays } from 'lucide-react';
import type { ComponentType } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/board', label: '看板', icon: Kanban },
  { href: '/charts', label: '图表', icon: PieChart },
  { href: '/timeline', label: '时间线', icon: CalendarDays },
  { href: '/settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={cn(
      'flex flex-col h-full bg-white dark:bg-zinc-900 transition-all duration-300 shadow-[1px_0_3px_rgba(0,0,0,0.04)] dark:shadow-[1px_0_3px_rgba(0,0,0,0.2)] rounded-br-2xl',
      collapsed ? 'w-16' : 'w-56'
    )}>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-700 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
