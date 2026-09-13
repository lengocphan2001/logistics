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

export type OrderItemStatus =
  | 'PENDING'
  | 'PURCHASED'
  | 'OUT_OF_STOCK'
  | 'PRICE_CHANGED'
  | 'REFUNDED';

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  PENDING: 'Chờ mua',
  PURCHASED: 'Đã mua',
  OUT_OF_STOCK: 'Hết hàng',
  PRICE_CHANGED: 'Đổi giá',
  REFUNDED: 'Đã hoàn tiền',
};

export interface OrderItemLine {
  id: string;
  status?: OrderItemStatus;
  purchasedPriceCny?: number | string | null;
  statusNote?: string | null;
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
  walletPaidAmount?: number | string;
  feeTransfer?: number | string;
  feeInsurance?: number | string;
  feeExtra?: number | string;
  quotedAt?: string | null;
  quoteExpiresAt?: string | null;
  quoteApprovedAt?: string | null;
  quoteNote?: string | null;
  sourceOrderCode?: string | null;
  sourceTrackingCode?: string | null;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  weight?: number | string | null;
  description?: string | null;
  note?: string | null;
}

/** Tiền của một đơn, do backend tính. */
export interface OrderAmounts {
  goodsCny: number;
  feesVnd: number;
  feesCny: number;
  paidCny: number;
  dueCny: number;
  overpaidCny: number;
  exchangeRate: number;
}

export interface OrderStep {
  status: OrderStatus;
  label: string;
}

/** Đơn kèm tiền và các bước của đúng loại đơn đó. */
export interface CustomerOrderSummary {
  order: CustomerOrderDetail;
  amounts: OrderAmounts;
  flow: OrderStep[];
  nextStatuses: OrderStep[];
  statusLabel: string;
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

  /** Đơn kèm công nợ và tiến trình theo đúng loại đơn. */
  getSummary: (id: string) =>
    api.get<CustomerOrderSummary>(`${BASE}/${id}/summary`),

  approveQuote: (id: string) =>
    api.post<CustomerOrderSummary>(`${BASE}/${id}/approve-quote`, {}),

  rejectQuote: (id: string, reason?: string) =>
    api.post<CustomerOrderSummary>(`${BASE}/${id}/reject-quote`, { reason }),

  cancel: (id: string, reason?: string) =>
    api.post<CustomerOrderSummary>(`${BASE}/${id}/cancel`, { reason }),
};
