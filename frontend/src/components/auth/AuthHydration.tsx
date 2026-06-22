'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { setToken } from '@/lib/auth';

/** Đảm bảo Zustand persist rehydrate xong trước khi guard auth chạy. */
export function AuthHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const finish = () => {
      const state = useAuthStore.getState();
      if (state.token) {
        setToken(state.token);
      }
      state.setHasHydrated(true);
    };

    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }

    return unsub;
  }, []);

  return children;
}
