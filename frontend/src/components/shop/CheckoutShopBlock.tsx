'use client';

import { Store } from 'lucide-react';
import type { CartItem } from '@/services/cart.service';
import { ProductImage } from '@/components/shop/ProductImage';
import { formatProperties } from '@/components/shop/product-display.utils';
import type { ShopGroup } from '@/lib/cart-groups';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

interface CheckoutShopBlockProps {
  group: ShopGroup;
  vndPerCny: number;
}

/** Column template shared by the header and every row from the medium breakpoint up. */
const ROW_COLUMNS = 'md:grid-cols-[minmax(0,1fr)_5.5rem_8rem_8rem]';

export function CheckoutShopBlock({ group, vndPerCny }: CheckoutShopBlockProps) {
  const shopTotalVnd = group.items.reduce(
    (sum, i) => sum + cnyToVnd(Number(i.priceCny) * i.quantity, vndPerCny),
    0,
  );

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--rule)] px-4 py-3">
        <Store {...icon('inline')} aria-hidden className="shrink-0 text-[var(--graphite)]" />
        <h2 className="truncate font-heading text-sm font-semibold text-[var(--ink)]">
          {group.shopName}
        </h2>
      </div>

      {/* Phones get stacked rows instead of a table that scrolls sideways. */}
      <div
        aria-hidden
        className={cn(
          'hidden border-b border-[var(--rule)] py-2.5 text-xs font-medium text-[var(--graphite)] md:grid',
          ROW_COLUMNS,
        )}
      >
        <span className="px-4">Sản phẩm</span>
        <span className="px-2 text-center">Số lượng</span>
        <span className="px-3 text-right">Đơn giá</span>
        <span className="px-4 text-right">Thành tiền</span>
      </div>

      <ul>
        {group.items.map((item) => (
          <CheckoutItemRow key={item.id} item={item} vndPerCny={vndPerCny} />
        ))}
      </ul>

      <div className="flex items-baseline justify-end gap-3 border-t border-[var(--rule)] px-4 py-3 text-sm">
        <span className="text-[var(--graphite)]">Tiền hàng shop</span>
        <span data-numeric className="font-bold text-[var(--ink)]">
          {formatVnd(shopTotalVnd)}
        </span>
      </div>
    </section>
  );
}

function CheckoutItemRow({
  item,
  vndPerCny,
}: {
  item: CartItem;
  vndPerCny: number;
}) {
  const unitCny = Number(item.priceCny);
  const unitVnd = cnyToVnd(unitCny, vndPerCny);
  const lineVnd = cnyToVnd(unitCny * item.quantity, vndPerCny);
  const propsText = formatProperties(item.properties);

  return (
    <li
      className={cn(
        'grid gap-y-2 border-b border-[var(--rule)] px-4 py-4 text-sm last:border-b-0 md:gap-y-0 md:px-0',
        ROW_COLUMNS,
      )}
    >
      <div className="min-w-0 md:px-4">
        <div className="flex gap-3">
          <ProductImage src={item.image} fallbackIcon="control" className="size-16 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)]">
              {item.title}
            </p>
            {propsText ? (
              <p className="text-xs text-[var(--graphite)]">Phân loại: {propsText}</p>
            ) : item.skuId ? (
              <p className="text-xs text-[var(--graphite)]">Đang tải phân loại</p>
            ) : (
              <p className="text-xs font-medium text-[var(--seal-red)]">
                Chưa chọn phân loại. Thêm lại từ trang chi tiết sản phẩm.
              </p>
            )}
            {item.note && (
              <p className="text-xs text-[var(--graphite)]">Ghi chú: {item.note}</p>
            )}
            <p data-numeric className="text-xs text-[var(--graphite)] md:hidden">
              {item.quantity} × {formatCny(unitCny)} ({formatVnd(unitVnd)})
            </p>
          </div>
        </div>
      </div>
      <p
        data-numeric
        className="hidden px-2 text-center font-medium text-[var(--ink)] md:block"
      >
        {item.quantity}
      </p>
      <div className="hidden px-3 text-right text-xs md:block">
        <p data-numeric className="font-semibold text-[var(--ink)]">
          {formatCny(unitCny)}
        </p>
        <p data-numeric className="text-[var(--graphite)]">
          {formatVnd(unitVnd)}
        </p>
      </div>
      <p data-numeric className="text-right text-sm font-bold text-[var(--ink)] md:px-4">
        {formatVnd(lineVnd)}
      </p>
    </li>
  );
}
