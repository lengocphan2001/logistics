import { create } from 'zustand';
import { cartService, type Cart } from '@/services/cart.service';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  itemCount: () => number;
  invalidate: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await cartService.getCart();
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  itemCount: () => {
    const cart = get().cart;
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, i) => sum + i.quantity, 0);
  },

  invalidate: () => {
    get().fetchCart();
  },
}));
