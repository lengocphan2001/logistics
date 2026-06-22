import api from '@/lib/api';
import type { Gender } from '@/lib/gender';

export interface CustomerBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface CustomerProfile {
  id: string;
  email?: string | null;
  name: string;
  username: string;
  phone?: string;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  shippingAddress?: string | null;
  bankInfo?: CustomerBankInfo | null;
  balance?: number | string;
  role: string;
  accountType: 'customer';
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  shippingAddress?: string;
  bankInfo?: CustomerBankInfo;
}

export const profileService = {
  get: () => api.get<CustomerProfile>('/auth/profile'),
  update: (data: UpdateProfilePayload) => api.patch<CustomerProfile>('/auth/profile', data),
};
