import api from '@/lib/api';
import type { PaginationParams } from '@/types';
import type { OrderStatus } from '@/lib/order-status';
import type { OrderType } from '@/lib/order-type';

export type { OrderStatus, OrderType };

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'BALANCE';

export interface Order {
  id: string;
  billOfLadingCode: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince?: string | null;
  receiverDistrict?: string | null;
  weight?: number | string | null;
  description?: string | null;
  quantity: number;
  declaredValue: number | string;
  codAmount: number | string;
  feeTransfer: number | string;
  feeInsurance: number | string;
  feeExtra: number | string;
  totalFee: number | string;
  note?: string | null;
  customerId?: string | null;
  depositAmount?: number | string;
  walletPaidAmount?: number | string;
  customer?: { id: string; fullName: string; phone: string; username?: string } | null;
  warehouseId?: string | null;
  warehouse?: { id: string; name: string; code: string } | null;
  // Taobao/1688 aggregator fields
  platform?: string | null;
  shopId?: string | null;
  shopName?: string | null;
  shopUrl?: string | null;
  itemsTotalCny?: number | string | null;
  items?: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  itemId: string;
  providerAlias: string;
  skuId?: string | null;
  title: string;
  image?: string | null;
  priceCny: number | string;
  quantity: number;
  totalCny: number | string;
  url?: string | null;
  properties?: { name: string; value: string }[] | null;
}

export interface CreateOrderPayload {
  type: OrderType;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince?: string;
  receiverDistrict?: string;
  weight?: number;
  description?: string;
  quantity?: number;
  declaredValue?: number;
  codAmount?: number;
  feeTransfer?: number;
  feeInsurance?: number;
  feeExtra?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  note?: string;
  customerId?: string;
  warehouseId?: string;
}

const BASE = '/orders';

export const ordersService = {
  getAll: (params?: PaginationParams & { status?: string; type?: string; customerId?: string }) =>
    api.get(BASE, { params }),
  getById: (id: string) => api.get(`${BASE}/${id}`),
  create: (data: CreateOrderPayload) => api.post(BASE, data),
  update: (id: string, data: Partial<CreateOrderPayload & { status?: OrderStatus; eventNote?: string }>) =>
    api.patch(`${BASE}/${id}`, data),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
  getStats: () => api.get(`${BASE}/stats`),
  chargeWallet: (
    id: string,
    data: { type: 'ORDER_DEPOSIT' | 'ORDER_PAYMENT'; amount: number; note?: string },
  ) => api.post(`${BASE}/${id}/wallet/charge`, data),
  refundWallet: (id: string, data: { amount: number; note?: string }) =>
    api.post(`${BASE}/${id}/wallet/refund`, data),
};
