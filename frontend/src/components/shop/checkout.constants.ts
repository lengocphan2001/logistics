/** Phí mua hộ (% trên tổng tiền hàng VNĐ) — hiển thị ước tính tại checkout */
export const PURCHASE_FEE_RATE = 0.03;

export const SHIPPING_METHODS = [
  { value: 'standard', label: 'Line Thường' },
  { value: 'express', label: 'Line Nhanh' },
  { value: 'economy', label: 'Line Tiết Kiệm' },
] as const;

export const OPTIONAL_SERVICES = [
  { id: 'inspect', label: 'Kiểm hàng' },
  { id: 'wood', label: 'Đóng gỗ' },
  { id: 'insurance', label: 'Bảo hiểm' },
  { id: 'bubble', label: 'Bọt khí' },
] as const;
