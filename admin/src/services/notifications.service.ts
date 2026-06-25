import api from '@/lib/api';
import type { PaginatedResponse } from '@/types';

export type NotificationType =
  | 'WALLET_DEPOSIT_REQUEST'
  | 'WALLET_WITHDRAWAL_REQUEST'
  | 'WALLET_REQUEST_APPROVED'
  | 'WALLET_REQUEST_REJECTED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  walletTransactionId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsResponse extends PaginatedResponse<Notification> {
  unreadCount: number;
}

const BASE = '/notifications';

export const notificationsService = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<NotificationsResponse>(BASE, { params }),
  getUnreadCount: () => api.get<{ count: number }>(`${BASE}/unread-count`),
  markAsRead: (id: string) => api.patch(`${BASE}/${id}/read`),
  markAllAsRead: () => api.patch(`${BASE}/read-all`),
};
