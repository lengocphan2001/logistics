import api from '@/lib/api';
import type { Shipment, PaginationParams } from '@/types';

const BASE = '/shipments';

export const shipmentsService = {
  getAll: (params?: PaginationParams) => api.get(BASE, { params }),
  getById: (id: string) => api.get(`${BASE}/${id}`),
  create: (data: Partial<Shipment>) => api.post(BASE, data),
  update: (id: string, data: Partial<Shipment>) => api.put(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`${BASE}/${id}/status`, { status }),
  track: (trackingCode: string) => api.get(`${BASE}/track/${trackingCode}`),
};
