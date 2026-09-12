'use client';

import { Suspense } from 'react';
import { PortalTopBar } from '@/components/portal/PortalTopBar';
import { PortalNavBar } from '@/components/portal/PortalNavBar';

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-shell min-h-screen bg-[var(--portal-bg)] text-[var(--portal-foreground)]">
      <PortalTopBar />
      <Suspense
        fallback={
          <div
            className="portal-nav-bar h-[49px] border-b border-[var(--navy-deep)]"
            aria-hidden
          />
        }
      >
        <PortalNavBar />
      </Suspense>
      <main>
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
