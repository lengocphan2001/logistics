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

export const orderTypeBadgeColors: Record<OrderType, string> = {
  CONSIGNMENT: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  PROXY_ORDER: 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  PROXY_PAYMENT: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  PROXY_PURCHASE: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
};

export const orderTypeDescriptions: Record<OrderType, string> = {
  CONSIGNMENT: 'Khách đã mua hàng, gửi hàng từ TQ về VN',
  PROXY_ORDER: 'Đặt hàng thay khách trên sàn TQ',
  PROXY_PAYMENT: 'Thanh toán đơn hàng TQ thay khách',
  PROXY_PURCHASE: 'Mua hàng hộ từ TQ về VN',
};
