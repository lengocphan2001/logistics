'use client';

import { useCallback, useEffect, useState } from 'react';
import { profileService, type CustomerProfile } from '@/services/profile.service';

export function useCustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await profileService.get();
      setProfile(res.data);
    } catch {
      setError('Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, refresh };
}
