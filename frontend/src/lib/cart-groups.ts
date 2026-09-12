import type { CartItem } from '@/services/cart.service';
import { getShopKey } from '@/components/shop/product-display.utils';

export interface ShopGroup {
  shopKey: string;
  shopName: string;
  items: CartItem[];
}

/** Cart items arrive flat; the cart and the checkout both show them per shop. */
export function groupCartByShop(items: CartItem[]): ShopGroup[] {
  const map = new Map<string, ShopGroup>();
  for (const item of items) {
    const shopKey = getShopKey(item);
    const shopName = item.shopName || item.shopId || 'Shop không xác định';
    if (!map.has(shopKey)) {
      map.set(shopKey, { shopKey, shopName, items: [] });
    }
    map.get(shopKey)!.items.push(item);
  }
  return Array.from(map.values());
}
