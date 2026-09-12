/**
 * Shop and checkout constants. Kept out of the components so the cart,
 * the checkout page and the product search read the same list.
 */

/** Marketplaces the search can be pointed at. Alias is the OTAPI provider id. */
export const PROVIDERS = [
  { alias: 'p1', label: 'Taobao' },
  { alias: 'p6', label: '1688' },
  { alias: 'p7', label: 'JD.com' },
] as const;

export const DEFAULT_PROVIDER = PROVIDERS[0].alias;

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
