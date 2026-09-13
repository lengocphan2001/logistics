export type OrderStatus =
  | 'NEW_REQUEST'
  | 'QUOTED'
  | 'CANCELLED'
  | 'DEPOSIT_PAID'
  | 'AWAITING_CN_ARRIVAL'
  | 'PURCHASED'
  | 'SHOP_SHIPPED'
  | 'AT_CN_WAREHOUSE'
  | 'IN_TRANSIT_TO_VN'
  | 'AT_VN_WAREHOUSE'
  | 'PAID'
  | 'COMPLETED'
  | 'COMPLAINT'
  | 'DELIVERY_REQUESTED';

export const orderStatusLabels: Record<OrderStatus, string> = {
  NEW_REQUEST: 'Yêu cầu mới',
  QUOTED: 'Đã báo giá, chờ khách duyệt',
  CANCELLED: 'Đã hủy',
  DEPOSIT_PAID: 'Đã thu tiền hàng',
  AWAITING_CN_ARRIVAL: 'Chờ hàng về kho Trung Quốc',
  PURCHASED: 'Đã mua hàng',
  SHOP_SHIPPED: 'Shop phát hàng',
  AT_CN_WAREHOUSE: 'Đã về kho Trung Quốc',
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
 *   red    — needs the customer or staff to act
 *   grey   — inactive
 *
 * Within navy, an outline marks the first steps and a fill marks the later
 * ones, so progress still reads at a glance.
 */
export const orderStatusBadgeColors: Record<OrderStatus, string> = {
  NEW_REQUEST:
    'border-[var(--seal-red)] bg-transparent text-[var(--seal-red)]',
  QUOTED:
    'border-[var(--seal-red)] bg-[var(--red-wash)] text-[var(--seal-red)]',
  AWAITING_CN_ARRIVAL:
    'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  AT_CN_WAREHOUSE:
    'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
  CANCELLED:
    'border-[var(--rule-strong)] bg-[var(--wash)] text-[var(--graphite)]',
  DEPOSIT_PAID:
    'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  PURCHASED:
    'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  SHOP_SHIPPED:
    'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
  IN_TRANSIT_TO_VN:
    'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
  AT_VN_WAREHOUSE:
    'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white',
  DELIVERY_REQUESTED:
    'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white',
  PAID:
    'border-[var(--green-wash)] bg-[var(--green-wash)] text-[var(--ledger-green)]',
  COMPLETED:
    'border-[var(--ledger-green)] bg-[var(--ledger-green)] text-white',
  COMPLAINT:
    'border-[var(--seal-red)] bg-[var(--red-wash)] text-[var(--seal-red)]',
};
