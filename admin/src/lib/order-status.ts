export type OrderStatus =
  | 'CANCELLED'
  | 'DEPOSIT_PAID'
  | 'PURCHASED'
  | 'SHOP_SHIPPED'
  | 'IN_TRANSIT_TO_VN'
  | 'AT_VN_WAREHOUSE'
  | 'PAID'
  | 'COMPLETED'
  | 'COMPLAINT'
  | 'DELIVERY_REQUESTED';

export const ORDER_STATUSES: OrderStatus[] = [
  'DEPOSIT_PAID',
  'PURCHASED',
  'SHOP_SHIPPED',
  'IN_TRANSIT_TO_VN',
  'AT_VN_WAREHOUSE',
  'PAID',
  'DELIVERY_REQUESTED',
  'COMPLETED',
  'COMPLAINT',
  'CANCELLED',
];

export const orderStatusLabels: Record<OrderStatus, string> = {
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

export const orderStatusBadgeColors: Record<OrderStatus, string> = {
  CANCELLED: 'bg-gray-500/15 text-gray-800 border-gray-500/25 dark:text-gray-300',
  DEPOSIT_PAID: 'bg-amber-500/15 text-amber-900 border-amber-500/25 dark:text-amber-300',
  PURCHASED: 'bg-blue-500/15 text-blue-900 border-blue-500/25 dark:text-blue-300',
  SHOP_SHIPPED: 'bg-indigo-500/15 text-indigo-900 border-indigo-500/25 dark:text-indigo-300',
  IN_TRANSIT_TO_VN: 'bg-violet-500/15 text-violet-900 border-violet-500/25 dark:text-violet-300',
  AT_VN_WAREHOUSE: 'bg-purple-500/15 text-purple-900 border-purple-500/25 dark:text-purple-300',
  PAID: 'bg-cyan-500/15 text-cyan-900 border-cyan-500/25 dark:text-cyan-300',
  COMPLETED: 'bg-green-500/15 text-green-900 border-green-500/25 dark:text-green-300',
  COMPLAINT: 'bg-red-500/15 text-red-900 border-red-500/25 dark:text-red-300',
  DELIVERY_REQUESTED: 'bg-orange-500/15 text-orange-900 border-orange-500/25 dark:text-orange-300',
};

export const orderStatusBarColors: Record<OrderStatus, string> = {
  CANCELLED: 'bg-gray-400',
  DEPOSIT_PAID: 'bg-amber-500',
  PURCHASED: 'bg-blue-500',
  SHOP_SHIPPED: 'bg-indigo-500',
  IN_TRANSIT_TO_VN: 'bg-violet-500',
  AT_VN_WAREHOUSE: 'bg-purple-500',
  PAID: 'bg-cyan-500',
  COMPLETED: 'bg-green-500',
  COMPLAINT: 'bg-red-500',
  DELIVERY_REQUESTED: 'bg-orange-500',
};

/** Đơn đang trong quá trình vận chuyển / xử lý */
export const inProgressStatuses: OrderStatus[] = [
  'PURCHASED',
  'SHOP_SHIPPED',
  'IN_TRANSIT_TO_VN',
  'AT_VN_WAREHOUSE',
  'PAID',
  'DELIVERY_REQUESTED',
];
