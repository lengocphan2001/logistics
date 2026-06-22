import api from '@/lib/api';

export interface ExchangeRate {
  vndPerCny: number;
  updatedAt: string;
}

const BASE = '/settings';

export const settingsService = {
  getExchangeRate: () => api.get<ExchangeRate>(`${BASE}/exchange-rate`),
  updateExchangeRate: (vndPerCny: number) =>
    api.patch<ExchangeRate>(`${BASE}/exchange-rate`, { vndPerCny }),
};
