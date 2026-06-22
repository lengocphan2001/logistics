import api from '@/lib/api';

const BASE = '/tracking';

export const trackingService = {
  track: (code: string) => api.get(`${BASE}/${code}`),
};
