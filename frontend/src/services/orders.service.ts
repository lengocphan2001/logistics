import api from '@/lib/api';
import type { OrderStatus } from '@/lib/order-status';
import type { OrderType } from '@/lib/order-type';

export interface CustomerOrder {
  id: string;
  billOfLadingCode: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: string;
  totalFee: number | string;
  depositAmount: number | string;
  declaredValue: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrdersResponse {
  data: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerOrderStats {
  total: number;
  byType: Partial<Record<OrderType, number>>;
}

export interface CustomerOrderEvent {
  id: string;
  status: OrderStatus;
  note?: string | null;
  location?: string | null;
  createdAt: string;
}

export interface OrderItemLine {
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

export interface CustomerOrderDetail extends CustomerOrder {
  events?: CustomerOrderEvent[];
  warehouse?: { id: string; name: string; code: string } | null;
  items?: OrderItemLine[];
  platform?: string | null;
  shopName?: string | null;
  shopUrl?: string | null;
  itemsTotalCny?: number | string | null;
}

const BASE = '/customer/orders';

export interface CustomerOrderRequestItem {
  title: string;
  url?: string;
  note?: string;
  quantity: number;
  priceCny?: number;
}

export interface CustomerOrderRequest {
  type: 'PROXY_ORDER' | 'PROXY_PAYMENT' | 'CONSIGNMENT';
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince?: string;
  receiverDistrict?: string;
  note?: string;
  cnWarehouseId?: string;
  vnWarehouseId?: string;
  shippingMethod?: string;
  items?: CustomerOrderRequestItem[];
  sourceOrderCode?: string;
  amountCny?: number;
  sourceTrackingCode?: string;
  description?: string;
}

export const ordersService = {
  getMine: (params?: {
    page?: number;
    limit?: number;
    type?: OrderType;
    status?: OrderStatus;
    search?: string;
  }) => api.get<CustomerOrdersResponse>(BASE, { params }),

  getMyStats: () => api.get<CustomerOrderStats>(`${BASE}/stats`),

  getMyById: (id: string) => api.get<CustomerOrderDetail>(`${BASE}/${id}`),

  createRequest: (payload: CustomerOrderRequest) =>
    api.post<CustomerOrderDetail>(`${BASE}/request`, payload),
};
