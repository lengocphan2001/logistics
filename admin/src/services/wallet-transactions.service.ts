import api from '@/lib/api';
import type { PaginationParams } from '@/types';
import type { WalletTransactionStatus, WalletTransactionType } from '@/lib/wallet-transaction';

export interface WalletTransaction {
  id: string;
  code: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number | string;
  vndAmount?: number | string | null;
  exchangeRate?: number | string | null;
  balanceBefore?: number | string | null;
  balanceAfter?: number | string | null;
  note?: string | null;
  rejectReason?: string | null;
  referenceCode?: string | null;
  customerId: string;
  orderId?: string | null;
  customer?: {
    id: string;
    fullName: string;
    phone: string;
    username: string;
    balance?: number | string;
  };
  order?: {
    id: string;
    billOfLadingCode: string;
    type: string;
    status: string;
  } | null;
  createdBy?: { id: string; name: string; email: string } | null;
  processedBy?: { id: string; name: string; email: string } | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletTransactionPayload {
  customerId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  vndAmount?: number;
  exchangeRate?: number;
  note?: string;
  referenceCode?: string;
  approveImmediately?: boolean;
}

const BASE = '/wallet-transactions';

export const walletTransactionsService = {
  getAll: (
    params?: PaginationParams & {
      type?: string;
      status?: string;
      customerId?: string;
      orderId?: string;
    },
  ) => api.get(BASE, { params }),
  getById: (id: string) => api.get(`${BASE}/${id}`),
  approve: (id: string, note?: string) => api.patch(`${BASE}/${id}/approve`, { note }),
  reject: (id: string, rejectReason: string) => api.patch(`${BASE}/${id}/reject`, { rejectReason }),
};
