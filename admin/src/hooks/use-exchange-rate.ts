'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settings.service';

const DEFAULT_RATE = 3500;

export function useExchangeRate() {
  const [vndPerCny, setVndPerCny] = useState(DEFAULT_RATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService
      .getExchangeRate()
      .then((res) => setVndPerCny(res.data.vndPerCny))
      .catch(() => setVndPerCny(DEFAULT_RATE))
      .finally(() => setLoading(false));
  }, []);

  return { vndPerCny, loading };
}
