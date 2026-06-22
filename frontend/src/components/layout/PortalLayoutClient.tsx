'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { PortalHeader, PortalSidebar } from '@/components/layout/PortalShell';

export function PortalLayoutClient({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader title={title} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
