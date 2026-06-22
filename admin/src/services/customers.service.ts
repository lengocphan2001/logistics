import api from '@/lib/api';
import type { PaginationParams } from '@/types';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface CustomerBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface Customer {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  shippingAddress?: string | null;
  bankInfo?: CustomerBankInfo | null;
  balance: number | string;
  note?: string | null;
  status: string;
  _count?: { orders: number };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerPayload {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  shippingAddress?: string;
  bankInfo?: CustomerBankInfo;
  balance?: number;
  note?: string;
  status?: string;
}

const BASE = '/customers';

export const customersService = {
  getAll: (params?: PaginationParams & { status?: string }) => api.get(BASE, { params }),
  getById: (id: string) => api.get(`${BASE}/${id}`),
  update: (id: string, data: Partial<UpdateCustomerPayload>) => api.patch(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
};
