'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useUIStore } from '@/stores/ui.store';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

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

  const pageTitle = title ?? Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? '';

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
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={pageTitle} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Breadcrumb />
            </div>

            {/* Page title block */}
            {pageTitle && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {pageTitle}
                </h1>
              </div>
            )}

            {/* Animated page content */}
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
