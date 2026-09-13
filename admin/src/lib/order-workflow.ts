import type { OrderStatus } from '@/lib/order-status';
import type { OrderSummary } from '@/services/orders.service';

/**
 * The admin does not decide what an order may do next — the server does, and
 * says so in the summary. This file only maps those answers onto buttons.
 */
export type OrderActionKey =
  | 'quote'
  | 'purchase'
  | 'cnReceive'
  | 'depart'
  | 'vnReceive'
  | 'settle'
  | 'requestDelivery'
  | 'deliver'
  | 'cancel';

type ActionSpec = {
  label: string;
  /** Where the step leaves the order; matched against the allowed next steps. */
  target?: OrderStatus;
  tone: 'primary' | 'outline' | 'destructive';
};

export const ORDER_ACTIONS: Record<OrderActionKey, ActionSpec> = {
  quote: { label: 'Báo giá', target: 'QUOTED', tone: 'primary' },
  purchase: { label: 'Xác nhận đã mua', target: 'PURCHASED', tone: 'primary' },
  cnReceive: {
    label: 'Nhận tại kho Trung Quốc',
    target: 'AT_CN_WAREHOUSE',
    tone: 'primary',
  },
  depart: { label: 'Xuất về Việt Nam', target: 'IN_TRANSIT_TO_VN', tone: 'primary' },
  vnReceive: {
    label: 'Nhận tại kho Việt Nam',
    target: 'AT_VN_WAREHOUSE',
    tone: 'primary',
  },
  settle: { label: 'Thu tiền', tone: 'primary' },
  requestDelivery: {
    label: 'Tạo yêu cầu giao',
    target: 'DELIVERY_REQUESTED',
    tone: 'outline',
  },
  deliver: { label: 'Đã giao khách', target: 'COMPLETED', tone: 'primary' },
  cancel: { label: 'Huỷ đơn', target: 'CANCELLED', tone: 'destructive' },
};

/** Nhãn riêng cho đơn thanh toán hộ: không mua hàng, chỉ trả tiền cho shop. */
const PAYMENT_LABELS: Partial<Record<OrderActionKey, string>> = {
  purchase: 'Xác nhận đã trả shop',
};

export function actionLabel(key: OrderActionKey, summary: OrderSummary): string {
  if (summary.order.type === 'PROXY_PAYMENT' && PAYMENT_LABELS[key]) {
    return PAYMENT_LABELS[key]!;
  }
  return ORDER_ACTIONS[key].label;
}

export function availableActions(summary: OrderSummary): OrderActionKey[] {
  const allowed = new Set(summary.nextStatuses.map((s) => s.status));
  const { order, amounts } = summary;

  return (Object.keys(ORDER_ACTIONS) as OrderActionKey[]).filter((key) => {
    // Collecting money is about the balance, not about the parcel's position.
    if (key === 'settle') {
      return amounts.dueCny > 0 && order.status !== 'CANCELLED';
    }

    // Consignment has nothing of ours to buy, and the backend only accepts the
    // purchase step once the goods have been paid for.
    if (key === 'purchase') {
      return order.type !== 'CONSIGNMENT' && order.status === 'DEPOSIT_PAID';
    }

    // Handing the parcel over is the last thing that happens, and only once
    // the customer owes nothing.
    if (key === 'deliver') {
      return allowed.has('COMPLETED') && amounts.dueCny === 0;
    }

    const target = ORDER_ACTIONS[key].target;
    return target ? allowed.has(target) : false;
  });
}

/**
 * Staff think in jobs, not in statuses. Each queue is one job someone has to
 * pick up, and the filters on the order list are built from these.
 */
export type WorkQueueKey =
  | 'all'
  | 'toQuote'
  | 'toBuy'
  | 'awaitingCn'
  | 'toDepart'
  | 'toCollect'
  | 'toDeliver';

export const WORK_QUEUES: Record<
  WorkQueueKey,
  { label: string; statuses: OrderStatus[] }
> = {
  all: { label: 'Tất cả', statuses: [] },
  toQuote: { label: 'Chờ báo giá', statuses: ['NEW_REQUEST'] },
  toBuy: { label: 'Chờ mua', statuses: ['DEPOSIT_PAID'] },
  awaitingCn: {
    label: 'Chờ về kho Trung Quốc',
    statuses: ['PURCHASED', 'SHOP_SHIPPED', 'AWAITING_CN_ARRIVAL'],
  },
  toDepart: { label: 'Chờ xuất', statuses: ['AT_CN_WAREHOUSE', 'QUOTED'] },
  toCollect: { label: 'Chờ thu tiền', statuses: ['AT_VN_WAREHOUSE'] },
  toDeliver: {
    label: 'Chờ giao',
    statuses: ['PAID', 'DELIVERY_REQUESTED'],
  },
};

export const WORK_QUEUE_ORDER: WorkQueueKey[] = [
  'all',
  'toQuote',
  'toBuy',
  'awaitingCn',
  'toDepart',
  'toCollect',
  'toDeliver',
];

/** Quá hạn nếu yêu cầu mới để quá số giờ này mà chưa báo giá. */
export const QUOTE_SLA_HOURS = 4;

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

/** Yêu cầu mới đã chờ báo giá quá lâu. */
export function isQuoteOverdue(order: {
  status: OrderStatus;
  createdAt: string;
}): boolean {
  return (
    order.status === 'NEW_REQUEST' && hoursSince(order.createdAt) > QUOTE_SLA_HOURS
  );
}

/** Báo giá đã gửi nhưng khách chưa duyệt và đã quá hạn. */
export function isQuoteExpired(order: {
  status: OrderStatus;
  quoteExpiresAt?: string | null;
  quoteApprovedAt?: string | null;
}): boolean {
  if (order.status !== 'QUOTED' || order.quoteApprovedAt) return false;
  if (!order.quoteExpiresAt) return false;
  return new Date(order.quoteExpiresAt).getTime() < Date.now();
}
