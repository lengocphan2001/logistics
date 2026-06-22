'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PortalTopBar } from '@/components/portal/PortalTopBar';
import { PortalNavBar } from '@/components/portal/PortalNavBar';

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-shell min-h-screen bg-[var(--portal-bg)] text-[var(--portal-foreground)]">
      <PortalTopBar />
      <Suspense
        fallback={
          <div className="portal-nav-bar flex h-12 items-center justify-center border-b border-[var(--brand-primary-dark)]/20">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-hero-text)]" />
          </div>
        }
      >
        <PortalNavBar />
      </Suspense>
      <main className="min-h-[calc(100vh-7.5rem)]">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
