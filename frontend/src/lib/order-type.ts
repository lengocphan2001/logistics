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

export const orderTypeShortLabels: Record<OrderType, string> = {
  CONSIGNMENT: 'Ký gửi',
  PROXY_ORDER: 'Đặt hàng hộ',
  PROXY_PAYMENT: 'Thanh toán hộ',
  PROXY_PURCHASE: 'Mua hộ',
};
