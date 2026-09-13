import { OrderStatus } from '@prisma/client';

/**
 * Vietnamese wording for each order status, used in notifications the
 * customer reads. The portal has its own copy for rendering; this one exists
 * so a message written on the server never contains a raw enum value.
 */
export const orderStatusLabels: Record<OrderStatus, string> = {
  NEW_REQUEST: 'Yêu cầu mới',
  CANCELLED: 'Đã hủy',
  DEPOSIT_PAID: 'Đặt cọc',
  PURCHASED: 'Đã mua hàng',
  SHOP_SHIPPED: 'Shop phát hàng',
  IN_TRANSIT_TO_VN: 'Đang về Việt Nam',
  AT_VN_WAREHOUSE: 'Về kho Việt Nam',
  PAID: 'Đã thanh toán',
  COMPLETED: 'Hoàn thành',
  COMPLAINT: 'Khiếu nại',
  DELIVERY_REQUESTED: 'Yêu cầu giao',
};
