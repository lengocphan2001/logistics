'use client';

import { Store } from 'lucide-react';
import type { CartItem } from '@/services/cart.service';
import { ProductImage } from '@/components/shop/ProductImage';
import { formatProperties } from '@/components/shop/product-display.utils';
import type { ShopGroup } from '@/lib/cart-groups';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';

interface CheckoutShopBlockProps {
  group: ShopGroup;
  vndPerCny: number;
}

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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] text-xs text-[var(--graphite)]">
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                Sản phẩm
              </th>
              <th scope="col" className="w-16 px-2 py-2.5 text-center font-medium">
                Số lượng
              </th>
              <th scope="col" className="w-32 px-3 py-2.5 text-right font-medium">
                Đơn giá
              </th>
              <th scope="col" className="w-32 px-4 py-2.5 text-right font-medium">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((item) => (
              <CheckoutItemRow key={item.id} item={item} vndPerCny={vndPerCny} />
            ))}
          </tbody>
        </table>
      </div>

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
    <tr className="border-b border-[var(--rule)] last:border-b-0">
      <td className="px-4 py-4 align-top">
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
          </div>
        </div>
      </td>
      <td
        data-numeric
        className="px-2 py-4 text-center align-top font-medium text-[var(--ink)]"
      >
        {item.quantity}
      </td>
      <td className="px-3 py-4 text-right align-top text-xs">
        <p data-numeric className="font-semibold text-[var(--ink)]">
          {formatCny(unitCny)}
        </p>
        <p data-numeric className="text-[var(--graphite)]">
          {formatVnd(unitVnd)}
        </p>
      </td>
      <td
        data-numeric
        className="px-4 py-4 text-right align-top text-sm font-bold text-[var(--ink)]"
      >
        {formatVnd(lineVnd)}
      </td>
    </tr>
  );
}
