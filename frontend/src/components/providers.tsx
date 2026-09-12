'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { LucideProvider } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { AuthHydration } from '@/components/auth/AuthHydration';
import { ICON_STROKE } from '@/lib/icon';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* One stroke weight for every icon in the product, set once. */}
      <LucideProvider strokeWidth={ICON_STROKE}>
        <AuthHydration>{children}</AuthHydration>
        <Toaster richColors position="top-right" />
      </LucideProvider>
    </QueryClientProvider>
  );
}
