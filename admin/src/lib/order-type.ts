export type OrderType =
  | 'CONSIGNMENT'
  | 'PROXY_ORDER'
  | 'PROXY_PAYMENT'
  | 'PROXY_PURCHASE';

export const ORDER_TYPES: OrderType[] = [
  'CONSIGNMENT',
  'PROXY_ORDER',
  'PROXY_PAYMENT',
  'PROXY_PURCHASE',
];

export const orderTypeLabels: Record<OrderType, string> = {
  CONSIGNMENT: 'Ký gửi',
  PROXY_ORDER: 'Đặt hàng hộ',
  PROXY_PAYMENT: 'Thanh toán hộ',
  PROXY_PURCHASE: 'Mua hộ',
};

/**
 * Order type is a category, not a state, so it takes no colour of its own:
 * one neutral outline for all four, told apart by the wording.
 */
export const orderTypeBadgeColors: Record<OrderType, string> = {
  CONSIGNMENT: 'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
  PROXY_ORDER: 'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
  PROXY_PAYMENT: 'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
  PROXY_PURCHASE: 'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
};

export const orderTypeDescriptions: Record<OrderType, string> = {
  CONSIGNMENT: 'Khách đã mua hàng, gửi hàng từ TQ về VN',
  PROXY_ORDER: 'Đặt hàng thay khách trên sàn TQ',
  PROXY_PAYMENT: 'Thanh toán đơn hàng TQ thay khách',
  PROXY_PURCHASE: 'Mua hàng hộ từ TQ về VN',
};
