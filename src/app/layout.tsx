import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { PwaRegister } from '@/components/shared/PwaRegister';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: '工作任务管理',
  description: '个人工作任务可视化管理平台',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '任务管理',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <PwaRegister />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
