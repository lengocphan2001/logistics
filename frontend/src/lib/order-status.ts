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
  CANCELLED: 'bg-stone-500/12 text-stone-700 border-stone-500/20',
  DEPOSIT_PAID: 'bg-amber-500/12 text-amber-800 border-amber-500/25',
  PURCHASED: 'bg-yellow-600/12 text-yellow-800 border-yellow-600/20',
  SHOP_SHIPPED: 'bg-orange-500/12 text-orange-800 border-orange-500/20',
  IN_TRANSIT_TO_VN: 'bg-amber-600/12 text-amber-900 border-amber-600/22',
  AT_VN_WAREHOUSE: 'bg-stone-600/12 text-stone-800 border-stone-600/20',
  PAID: 'bg-emerald-600/12 text-emerald-800 border-emerald-600/20',
  COMPLETED: 'bg-green-600/12 text-green-800 border-green-600/20',
  COMPLAINT: 'bg-red-500/12 text-red-800 border-red-500/20',
  DELIVERY_REQUESTED: 'bg-orange-600/12 text-orange-900 border-orange-600/22',
};
