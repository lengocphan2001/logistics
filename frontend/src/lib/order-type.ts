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

/** Types a customer raises by hand. Buying through the catalogue uses the cart. */
export const CUSTOMER_REQUEST_TYPES = [
  'PROXY_ORDER',
  'PROXY_PAYMENT',
  'CONSIGNMENT',
] as const;

export type CustomerRequestType = (typeof CUSTOMER_REQUEST_TYPES)[number];

export const orderTypeDescriptions: Record<CustomerRequestType, string> = {
  PROXY_ORDER:
    'Bạn gửi link sản phẩm, nhân viên đặt hàng trên sàn Trung Quốc thay bạn.',
  PROXY_PAYMENT:
    'Bạn đã tự tạo đơn trên sàn, nhân viên thanh toán hộ bằng tài khoản Trung Quốc.',
  CONSIGNMENT:
    'Bạn đã mua và gửi hàng tới kho Trung Quốc, chúng tôi vận chuyển về Việt Nam.',
};
