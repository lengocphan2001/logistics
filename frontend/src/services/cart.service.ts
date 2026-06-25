import api from '@/lib/api';

export interface CartItemProperty {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  itemId: string;
  providerAlias: string;
  skuId?: string;
  title: string;
  image?: string;
  url?: string;
  shopId?: string;
  shopName?: string;
  platform?: string;
  priceCny: number;
  quantity: number;
  note?: string | null;
  properties?: CartItemProperty[];
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface UpsertCartItemPayload {
  itemId: string;
  providerAlias: string;
  skuId?: string;
  title: string;
  image?: string;
  url?: string;
  shopId?: string;
  shopName?: string;
  platform?: string;
  priceCny: number;
  quantity: number;
  properties?: CartItemProperty[];
}

export interface CheckoutPayload {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince?: string;
  receiverDistrict?: string;
  note?: string;
  cartItemIds?: string[];
  vnWarehouseId?: string;
  cnWarehouseId?: string;
  shippingMethod?: string;
}

export const cartService = {
  getCart: (options?: { enrichProperties?: boolean }): Promise<Cart> =>
    api
      .get('/customer/cart', {
        params: options?.enrichProperties ? { enrichProperties: '1' } : undefined,
      })
      .then((r) => r.data),

  upsertItem: (payload: UpsertCartItemPayload): Promise<CartItem> =>
    api.post('/customer/cart/items', payload).then((r) => r.data),

  updateItem: (id: string, payload: { quantity?: number; note?: string }): Promise<CartItem> =>
    api
      .patch(`/customer/cart/items/${id}`, {
        ...(payload.quantity != null ? { quantity: Math.floor(payload.quantity) } : {}),
        ...(payload.note !== undefined ? { note: payload.note } : {}),
      })
      .then((r) => r.data),

  removeShop: (shopKey: string): Promise<{ success: boolean; deleted: number }> =>
    api.delete(`/customer/cart/shops/${encodeURIComponent(shopKey)}`).then((r) => r.data),

  removeItem: (id: string): Promise<void> =>
    api.delete(`/customer/cart/items/${id}`).then((r) => r.data),

  clearCart: (): Promise<void> =>
    api.delete('/customer/cart').then((r) => r.data),

  checkout: (payload: CheckoutPayload): Promise<{ success: boolean; orderIds: string[] }> =>
    api.post('/customer/orders/checkout', payload).then((r) => r.data),
};
