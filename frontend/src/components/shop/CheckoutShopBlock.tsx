'use client';

import { productsService } from '@/services/products.service';
import type { CartItem } from '@/services/cart.service';
import { formatProperties } from '@/components/shop/product-display.utils';
import type { ShopGroup } from '@/components/shop/CartShopGroup';
import { cnyToVnd, formatVnd } from '@/lib/currency';

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
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2.5">
        <p className="truncate text-sm font-semibold tracking-wide text-white">
          Tên shop: {group.shopName}
        </p>
      </div>

      <div className="overflow-x-auto bg-[#fffdf8]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-amber-100/80 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Thông tin sản phẩm</th>
              <th className="w-16 px-2 py-3 text-center">SL</th>
              <th className="w-36 px-3 py-3 text-right">Đơn giá (¥/VNĐ)</th>
              <th className="w-32 px-4 py-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50">
            {group.items.map((item) => (
              <CheckoutItemRow key={item.id} item={item} vndPerCny={vndPerCny} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-gray-100 bg-white px-4 py-2.5 text-sm">
        <span className="text-gray-500">Tiền hàng shop:&nbsp;</span>
        <span className="font-semibold text-red-600">{formatVnd(shopTotalVnd)}</span>
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
    <tr>
      <td className="px-4 py-4 align-top">
        <div className="flex gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            {item.image ? (
              <img
                src={productsService.imageProxyUrl(item.image)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800">
              {item.title}
            </p>
            {propsText ? (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-600">Thuộc tính:</span> {propsText}
              </p>
            ) : item.skuId ? (
              <p className="text-xs text-gray-400 italic">Đang tải thuộc tính...</p>
            ) : (
              <p className="text-xs text-amber-600">
                Chưa chọn phân loại — vui lòng thêm lại từ trang chi tiết sản phẩm
              </p>
            )}
            {item.note && (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-600">Ghi chú:</span> {item.note}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-4 text-center align-top font-medium text-gray-700">
        {item.quantity}
      </td>
      <td className="px-3 py-4 text-right align-top text-xs">
        <p className="font-semibold text-gray-800">{unitCny.toFixed(0)}</p>
        <p className="text-gray-500">{formatVnd(unitVnd).replace('₫', '').trim()}</p>
      </td>
      <td className="px-4 py-4 text-right align-top font-semibold text-gray-900">
        {formatVnd(lineVnd)}
      </td>
    </tr>
  );
}
