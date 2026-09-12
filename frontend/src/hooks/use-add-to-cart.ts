'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { cartService, type UpsertCartItemPayload } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import { useCommitFeedback } from '@/hooks/use-commit-feedback';
import { apiErrorMessage } from '@/lib/api-error';

/**
 * Adding to the cart is the same four steps everywhere: call the API, refresh
 * the cart count, run the confirmation beat, tell the customer.
 *
 * `committed` stays true briefly after a success so the button can show a
 * check mark; `pending` is true while the request is in flight.
 */
export function useAddToCart() {
  const invalidate = useCartStore((s) => s.invalidate);
  const { committed, commit } = useCommitFeedback();
  const [pending, setPending] = useState(false);

  const addToCart = useCallback(
    async (payload: UpsertCartItemPayload): Promise<boolean> => {
      setPending(true);
      try {
        await cartService.upsertItem(payload);
        invalidate();
        commit();
        toast.success('Đã thêm vào giỏ hàng');
        return true;
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Không thể thêm vào giỏ hàng'));
        return false;
      } finally {
        setPending(false);
      }
    },
    [invalidate, commit],
  );

  return { addToCart, pending, committed };
}
