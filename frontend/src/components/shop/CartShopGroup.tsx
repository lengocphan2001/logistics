'use client';

import { useMemo, useState } from 'react';
import { Loader2, Store, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CartItemRow } from '@/components/shop/CartItemRow';
import { cartService } from '@/services/cart.service';
import { OPTIONAL_SERVICES } from '@/config/shop.config';
import type { ShopGroup } from '@/lib/cart-groups';
import { cnyToVnd, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';

interface CartShopGroupProps {
  group: ShopGroup;
  vndPerCny: number;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  onToggleShop: (ids: string[], select: boolean) => void;
  onRemoveShop: () => void;
  onRemoveItem: (id: string) => void;
  onRefresh: () => void;
}

export function CartShopGroup({
  group,
  vndPerCny,
  selectedIds,
  onToggleItem,
  onToggleShop,
  onRemoveShop,
  onRemoveItem,
  onRefresh,
}: CartShopGroupProps) {
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [removingShop, setRemovingShop] = useState(false);

  const shopItemIds = group.items.map((i) => i.id);
  const allSelected = shopItemIds.every((id) => selectedIds.has(id));
  const someSelected = shopItemIds.some((id) => selectedIds.has(id));

  const shopTotalVnd = useMemo(
    () =>
      group.items
        .filter((i) => selectedIds.has(i.id))
        .reduce((sum, i) => sum + cnyToVnd(Number(i.priceCny) * i.quantity, vndPerCny), 0),
    [group.items, selectedIds, vndPerCny],
  );

  const handleRemoveShop = async () => {
    setRemovingShop(true);
    try {
      await cartService.removeShop(group.shopKey);
      onRemoveShop();
      onRefresh();
      toast.success('Đã xóa shop khỏi giỏ hàng');
    } catch {
      toast.error('Không thể xóa shop');
    } finally {
      setRemovingShop(false);
    }
  };

  return (
    <section className="panel overflow-hidden">
      {/* The shop is a heading, not a coloured banner — colour in the cart is
          reserved for money and for the destructive action. */}
      <div className="flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
          }}
          onChange={() => onToggleShop(shopItemIds, !allSelected)}
          aria-label={`Chọn tất cả sản phẩm của ${group.shopName}`}
          className="size-4 shrink-0 cursor-pointer accent-[var(--manifest-navy)]"
        />
        <Store {...icon('inline')} aria-hidden className="shrink-0 text-[var(--graphite)]" />
        <h2 className="flex-1 truncate font-heading text-sm font-semibold text-[var(--ink)]">
          {group.shopName}
        </h2>
        <button
          type="button"
          disabled={removingShop}
          onClick={handleRemoveShop}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1 text-xs font-medium text-[var(--graphite)] hover:bg-[var(--red-wash)] hover:text-[var(--seal-red)] disabled:opacity-50"
        >
          {removingShop ? (
            <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
          ) : (
            <Trash2 {...icon('inline')} aria-hidden />
          )}
          Xóa shop
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[660px] text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-xs text-[var(--graphite)]">
                <th scope="col" className="w-10 px-2 py-2.5">
                  <span className="sr-only">Chọn</span>
                </th>
                <th scope="col" className="px-3 py-2.5 text-left font-medium">
                  Sản phẩm
                </th>
                <th scope="col" className="w-28 px-2 py-2.5 text-center font-medium">
                  Số lượng
                </th>
                <th scope="col" className="w-28 px-2 py-2.5 text-right font-medium">
                  Đơn giá
                </th>
                <th scope="col" className="w-32 px-2 py-2.5 text-right font-medium">
                  Thành tiền
                </th>
                <th scope="col" className="w-10 px-2 py-2.5">
                  <span className="sr-only">Xóa</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  vndPerCny={vndPerCny}
                  selected={selectedIds.has(item.id)}
                  onToggle={() => onToggleItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>

        <aside className="w-full shrink-0 border-t border-[var(--rule)] bg-[var(--wash)]/60 p-4 lg:w-60 lg:border-l lg:border-t-0">
          <h3 className="mb-3 text-xs font-semibold text-[var(--ink)]">Dịch vụ tuỳ chọn</h3>
          <div className="space-y-2.5">
            {OPTIONAL_SERVICES.map((svc) => (
              <label
                key={svc.id}
                className="flex cursor-pointer items-center gap-2 text-xs text-[var(--graphite)]"
              >
                <input
                  type="checkbox"
                  checked={!!services[svc.id]}
                  onChange={(e) =>
                    setServices((prev) => ({ ...prev, [svc.id]: e.target.checked }))
                  }
                  className="size-3.5 accent-[var(--manifest-navy)]"
                />
                {svc.label}
              </label>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--rule)] pt-3">
            <p className="text-xs text-[var(--graphite)]">Tiền hàng đã chọn</p>
            <p data-numeric className="text-lg font-bold text-[var(--seal-red)]">
              {formatVnd(shopTotalVnd)}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
