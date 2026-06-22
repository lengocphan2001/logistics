import api from '../lib/api';
export const ordersService = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get('/orders/'+id),
};
