'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useUIStore } from '@/stores/ui.store';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/orders': 'Đơn hàng',
  '/shipments': 'Vận chuyển',
  '/customers': 'Khách hàng',
  '/wallet-transactions': 'Lịch sử giao dịch',
  '/drivers': 'Tài xế',
  '/vehicles': 'Phương tiện',
  '/reports': 'Báo cáo',
  '/settings': 'Cài đặt',
  '/warehouses': 'Kho hàng',
  '/staff': 'Nhân viên',
};

export function DashboardShell({ children, title }: DashboardShellProps) {
  const { sidebarOpen, setSidebarOpen, theme } = useUIStore();
  const pathname = usePathname();

  const pageTitle =
    title ??
    Object.entries(pageTitles).find(
      ([key]) => pathname === key || pathname.startsWith(key + '/'),
    )?.[1] ??
    '';

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="dock-scrim fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={pageTitle} />

        {/* The page owns its own heading, so the shell only sets the measure
            and the breadcrumb that detail pages need. */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-5 px-4 py-5 sm:px-6">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
