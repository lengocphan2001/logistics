import { OrderType } from '@prisma/client';

/** Vietnamese wording for each order type, for server-generated documents. */
export const orderTypeLabels: Record<OrderType, string> = {
  CONSIGNMENT: 'Ký gửi',
  PROXY_ORDER: 'Đặt hàng hộ',
  PROXY_PAYMENT: 'Thanh toán hộ',
  PROXY_PURCHASE: 'Mua hộ',
};
