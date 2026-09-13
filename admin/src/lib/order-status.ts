export type OrderStatus =
  | 'NEW_REQUEST'
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
  'NEW_REQUEST',
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

/**
 * Colour states the class of the stage, the wording states the stage itself.
 * Ten hues would be ten things to learn; three are enough to scan a list:
 *
 *   navy   — the order is moving
 *   green  — money settled or the order is closed
 *   red    — needs someone to act
 *   grey   — inactive
 *
 * Within navy, an outline marks the first steps and a fill marks the later
 * ones, so progress still reads at a glance.
 */
export const orderStatusBadgeColors: Record<OrderStatus, string> = {
  NEW_REQUEST:
    'border-[var(--seal-red)] bg-transparent text-[var(--seal-red)]',
  CANCELLED: 'border-[var(--rule-strong)] bg-[var(--wash)] text-[var(--graphite)]',
  DEPOSIT_PAID: 'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  PURCHASED: 'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  SHOP_SHIPPED: 'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
  IN_TRANSIT_TO_VN: 'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
  AT_VN_WAREHOUSE: 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white',
  DELIVERY_REQUESTED: 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white',
  PAID: 'border-[var(--green-wash)] bg-[var(--green-wash)] text-[var(--ledger-green)]',
  COMPLETED: 'border-[var(--ledger-green)] bg-[var(--ledger-green)] text-white',
  COMPLAINT: 'border-[var(--seal-red)] bg-[var(--red-wash)] text-[var(--seal-red)]',
};

/** Fill used in the dashboard status bar. Same four classes as the badges. */
export const orderStatusBarColors: Record<OrderStatus, string> = {
  NEW_REQUEST: 'bg-[var(--seal-red)]',
  CANCELLED: 'bg-[var(--rule-strong)]',
  DEPOSIT_PAID: 'bg-[var(--navy-wash)]',
  PURCHASED: 'bg-[var(--navy-wash)]',
  SHOP_SHIPPED: 'bg-[#4a7ba8]',
  IN_TRANSIT_TO_VN: 'bg-[#4a7ba8]',
  AT_VN_WAREHOUSE: 'bg-[var(--manifest-navy)]',
  DELIVERY_REQUESTED: 'bg-[var(--manifest-navy)]',
  PAID: 'bg-[#4fa389]',
  COMPLETED: 'bg-[var(--ledger-green)]',
  COMPLAINT: 'bg-[var(--seal-red)]',
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
