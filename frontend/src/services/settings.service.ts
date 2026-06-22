import api from '@/lib/api';

export interface ExchangeRate {
  vndPerCny: number;
  updatedAt: string;
}

export const settingsService = {
  getExchangeRate: () => api.get<ExchangeRate>('/settings/exchange-rate'),
};
