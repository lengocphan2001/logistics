'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { CartShopGroup } from '@/components/shop/CartShopGroup';
import { groupCartByShop } from '@/lib/cart-groups';
import { PurchaseProgress } from '@/components/shop/PurchaseProgress';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';

export default function CartPage() {
  const { cart, loading, fetchCart, invalidate } = useCartStore();
  const { vndPerCny } = useExchangeRate();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart?.items) {
      setSelectedIds(new Set(cart.items.map((i) => i.id)));
    }
  }, [cart?.items]);

  const shopGroups = useMemo(
    () => (cart?.items ? groupCartByShop(cart.items) : []),
    [cart?.items],
  );

  const selectedItems = cart?.items.filter((i) => selectedIds.has(i.id)) ?? [];
  const selectedTotalCny = selectedItems.reduce(
    (sum, i) => sum + Number(i.priceCny) * i.quantity,
    0,
  );
  const selectedTotalVnd = cnyToVnd(selectedTotalCny, vndPerCny);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShop = (ids: string[], select: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  if (loading && !cart) {
    return <LoadingState label="Đang tải giỏ hàng" />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Giỏ hàng trống"
        hint="Giỏ hàng lưu trên tài khoản của bạn. Đăng nhập trên thiết bị khác vẫn thấy cùng sản phẩm."
      >
        <Button variant="commerce" onClick={() => router.push('/shop')}>
          Bắt đầu mua hàng
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="space-y-4 border-b border-[var(--rule)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">Giỏ hàng</h1>
          <p className="mt-1 text-sm text-[var(--graphite)]">
            <span data-numeric className="font-semibold text-[var(--ink)]">
              {cart.items.length}
            </span>{' '}
            sản phẩm từ{' '}
            <span data-numeric className="font-semibold text-[var(--ink)]">
              {shopGroups.length}
            </span>{' '}
            shop
          </p>
        </div>
        <PurchaseProgress current="Giỏ hàng" className="max-w-md" />
      </div>

      <div className="space-y-5">
        {shopGroups.map((group) => (
          <CartShopGroup
            key={group.shopKey}
            group={group}
            vndPerCny={vndPerCny}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
            onToggleShop={toggleShop}
            onRemoveShop={() => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                group.items.forEach((i) => next.delete(i.id));
                return next;
              });
            }}
            onRemoveItem={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }}
            onRefresh={invalidate}
          />
        ))}
      </div>

      {/* The only element allowed to float, because it must stay reachable
          while the list scrolls. */}
      <div className="sticky bottom-3 border border-[var(--rule)] bg-[var(--sheet-white)] p-4 shadow-[var(--lift)] sm:bottom-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-[var(--graphite)]">
              Đã chọn{' '}
              <span data-numeric className="font-semibold text-[var(--ink)]">
                {selectedItems.length}
              </span>{' '}
              trên{' '}
              <span data-numeric>{cart.items.length}</span> sản phẩm
            </p>
            <p data-numeric className="text-2xl font-bold text-[var(--seal-red)]">
              {formatVnd(selectedTotalVnd)}
            </p>
            <p data-numeric className="text-sm text-[var(--graphite)]">
              {formatCny(selectedTotalCny)}
            </p>
            <p data-prose className="mt-1 text-xs">
              Chưa gồm phí vận chuyển và dịch vụ.
            </p>
          </div>
          <Button
            variant="commerce"
            size="lg"
            disabled={selectedItems.length === 0}
            className="w-full sm:w-auto sm:min-w-[200px]"
            onClick={() =>
              router.push(`/checkout?items=${Array.from(selectedIds).join(',')}`)
            }
          >
            Đặt hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
