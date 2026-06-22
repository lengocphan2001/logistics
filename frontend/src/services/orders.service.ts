import api from '@/lib/api';

const BASE = '/orders';

export const ordersService = {
  getAll: () => api.get(BASE),
  getById: (id: string) => api.get(`${BASE}/${id}`),
  create: (data: any) => api.post(BASE, data),
};
