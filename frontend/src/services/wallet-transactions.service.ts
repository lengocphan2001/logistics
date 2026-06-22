import api from '@/lib/api';
import type { WalletTransactionStatus, WalletTransactionType } from '@/lib/wallet-transaction';

export interface WalletTransaction {
  id: string;
  code: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number | string;
  vndAmount?: number | string | null;
  balanceBefore?: number | string | null;
  balanceAfter?: number | string | null;
  note?: string | null;
  rejectReason?: string | null;
  referenceCode?: string | null;
  orderId?: string | null;
  order?: { id: string; billOfLadingCode: string } | null;
  createdAt: string;
}

export interface RequestWalletTransactionPayload {
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  vndAmount?: number;
  note?: string;
  referenceCode?: string;
}

export const walletTransactionsService = {
  getMine: (params?: { page?: number; limit?: number; type?: string; status?: string }) =>
    api.get('/wallet-transactions/me', { params }),
  request: (data: RequestWalletTransactionPayload) =>
    api.post('/wallet-transactions/request', data),
};
