import api from '@/lib/api';
import type { PaginationParams } from '@/types';
import type { OrderStatus } from '@/lib/order-status';
import type { OrderType } from '@/lib/order-type';

export type { OrderStatus, OrderType };

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'BALANCE';

export interface Order {
  /** Mã đơn khách đã tạo trên sàn (thanh toán hộ). */
  sourceOrderCode?: string | null;
  /** Mã vận đơn nội địa Trung Quốc (ký gửi). */
  sourceTrackingCode?: string | null;
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
  customer?: {
    id: string;
    fullName: string;
    phone: string;
    username?: string;
    balance?: number | string;
  } | null;
  warehouseId?: string | null;
  warehouse?: { id: string; name: string; code: string } | null;
  // Taobao/1688 aggregator fields
  platform?: string | null;
  shopId?: string | null;
  shopName?: string | null;
  shopUrl?: string | null;
  itemsTotalCny?: number | string | null;
  items?: AdminOrderItem[];
  events?: OrderEvent[];
  /** Mã đơn nhân viên mua được trên sàn. */
  purchaseOrderCode?: string | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  assignedAt?: string | null;
  cnWarehouseId?: string | null;
  cnWarehouse?: { id: string; name: string; code: string } | null;
  quotedAt?: string | null;
  quoteExpiresAt?: string | null;
  quoteApprovedAt?: string | null;
  quoteNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  note?: string | null;
  location?: string | null;
  createdAt: string;
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

/** Đơn kèm tiền và các bước hợp lệ kế tiếp. */
export interface OrderSummary {
  order: Order;
  amounts: OrderAmounts;
  flow: OrderStep[];
  nextStatuses: OrderStep[];
  statusLabel: string;
}

export interface OrderItemUpdate {
  id: string;
  status: OrderItemStatus;
  purchasedPriceCny?: number;
  statusNote?: string;
}

export type OrderItemStatus =
  | 'PENDING'
  | 'PURCHASED'
  | 'OUT_OF_STOCK'
  | 'PRICE_CHANGED'
  | 'REFUNDED';

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  PENDING: 'Chưa mua',
  PURCHASED: 'Đã mua',
  OUT_OF_STOCK: 'Hết hàng',
  PRICE_CHANGED: 'Đổi giá',
  REFUNDED: 'Đã hoàn tiền',
};

export interface AdminOrderItem {
  id: string;
  status: OrderItemStatus;
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
  properties?:
    | {
        name: string;
        value: string;
        /** Original marketplace wording, used by staff on the shop page. */
        nameOriginal?: string;
        valueOriginal?: string;
      }[]
    | null;
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

  // --- Các bước xử lý đơn. Mỗi bước tự quyết trạng thái kết quả. ---
  getSummary: (id: string) => api.get<OrderSummary>(`${BASE}/${id}/summary`),
  assign: (id: string, assignedToId: string | null) =>
    api.post<Order>(`${BASE}/${id}/assign`, { assignedToId }),
  quote: (
    id: string,
    data: {
      itemsTotalCny?: number;
      feeTransfer?: number;
      feeInsurance?: number;
      feeExtra?: number;
      expiresInHours?: number;
      note?: string;
    },
  ) => api.post<OrderSummary>(`${BASE}/${id}/quote`, data),
  purchase: (
    id: string,
    data: { purchaseOrderCode?: string; items?: OrderItemUpdate[]; note?: string },
  ) => api.post<OrderSummary>(`${BASE}/${id}/purchase`, data),
  cnReceive: (
    id: string,
    data: {
      cnWarehouseId?: string;
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
      sourceTrackingCode?: string;
      note?: string;
    },
  ) => api.post<OrderSummary>(`${BASE}/${id}/cn-receive`, data),
  depart: (id: string, data: { estimatedDelivery?: string; note?: string }) =>
    api.post<OrderSummary>(`${BASE}/${id}/depart`, data),
  vnReceive: (id: string, data: { warehouseId?: string; note?: string }) =>
    api.post<OrderSummary>(`${BASE}/${id}/vn-receive`, data),
  settle: (id: string, data: { amount?: number; note?: string }) =>
    api.post<OrderSummary>(`${BASE}/${id}/settle`, data),
  requestDelivery: (id: string, data: { note?: string }) =>
    api.post<OrderSummary>(`${BASE}/${id}/request-delivery`, data),
  deliver: (id: string, data: { driverId?: string; note?: string }) =>
    api.post<OrderSummary>(`${BASE}/${id}/deliver`, data),
  cancel: (id: string, data: { reason: string; refund?: boolean }) =>
    api.post<OrderSummary>(`${BASE}/${id}/cancel`, data),
  updateItems: (id: string, items: OrderItemUpdate[]) =>
    api.patch<OrderSummary>(`${BASE}/${id}/items`, { items }),
};
