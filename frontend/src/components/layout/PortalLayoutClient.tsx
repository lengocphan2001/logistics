'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { getToken } from '@/lib/auth';
import { LoadingState } from '@/components/ui/loading-state';
import { PortalShell } from '@/components/layout/PortalShell';

export function PortalLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;

    const authed = isAuthenticated || !!getToken();
    if (!authed) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--dock-grey)]">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated && !getToken()) {
    return null;
  }

  return <PortalShell>{children}</PortalShell>;
}
