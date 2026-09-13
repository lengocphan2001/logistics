'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import type { CustomerOrderDetail } from '@/services/orders.service';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

/**
 * Puts every line of a past order back in the cart. Prices are re-read from
 * the order, not from the marketplace, so the customer sees what they paid and
 * the cart refreshes the live price when they open it.
 */
export function ReorderButton({ order }: { order: CustomerOrderDetail }) {
  const router = useRouter();
  const invalidate = useCartStore((s) => s.invalidate);
  const [pending, setPending] = useState(false);

  const items = (order.items ?? []).filter((i) => i.itemId && i.providerAlias);
  if (items.length === 0) return null;

  const handleReorder = async () => {
    setPending(true);
    let added = 0;
    try {
      for (const item of items) {
        await cartService.upsertItem({
          itemId: item.itemId,
          providerAlias: item.providerAlias,
          skuId: item.skuId ?? undefined,
          title: item.title,
          image: item.image ?? undefined,
          url: item.url ?? undefined,
          shopId: order.shopName ? undefined : undefined,
          shopName: order.shopName ?? undefined,
          platform: order.platform ?? undefined,
          priceCny: Number(item.priceCny) || 0,
          quantity: item.quantity,
          properties: item.properties ?? undefined,
        });
        added += 1;
      }
      invalidate();
      toast.success(`Đã thêm ${added} sản phẩm vào giỏ hàng`);
      router.push('/cart');
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err,
          added > 0
            ? `Đã thêm ${added} sản phẩm, phần còn lại thất bại`
            : 'Không thể thêm vào giỏ hàng',
        ),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleReorder} disabled={pending}>
      {pending ? (
        <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
      ) : (
        <RotateCcw {...icon('inline')} aria-hidden />
      )}
      Đặt lại đơn này
    </Button>
  );
}
