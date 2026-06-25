'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { CartShopGroup, groupCartByShop } from '@/components/shop/CartShopGroup';
import { Button } from '@/components/ui/button';
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
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <ShoppingBag className="mb-4 h-16 w-16 opacity-20" />
        <h2 className="text-lg font-medium text-gray-700">Giỏ hàng trống</h2>
        <p className="mt-1 max-w-sm text-center text-sm">
          Giỏ hàng được lưu trên tài khoản của bạn — đăng nhập trên thiết bị khác vẫn thấy cùng
          sản phẩm.
        </p>
        <Link
          href="/shop"
          className="mt-5 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Mua hàng ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Giỏ hàng</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cart.items.length} sản phẩm · {shopGroups.length} shop · đồng bộ theo tài khoản
          </p>
        </div>
      </div>

      <div className="space-y-6">
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

      <div className="sticky bottom-4 rounded-xl border border-amber-200 bg-white p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Đã chọn {selectedItems.length} / {cart.items.length} sản phẩm
            </p>
            <p className="text-2xl font-bold text-red-600">{formatVnd(selectedTotalVnd)}</p>
            <p className="text-sm text-gray-500">{formatCny(selectedTotalCny)}</p>
            <p className="text-xs text-gray-400">* Chưa bao gồm phí vận chuyển & dịch vụ</p>
          </div>
          <Button
            size="lg"
            disabled={selectedItems.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() =>
              router.push(`/checkout?items=${Array.from(selectedIds).join(',')}`)
            }
          >
            Đặt hàng ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
