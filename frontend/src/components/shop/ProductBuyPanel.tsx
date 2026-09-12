'use client';

import { useState } from 'react';
import { Check, Loader2, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ProductImage } from '@/components/shop/ProductImage';
import { platformLabel } from '@/components/shop/product-display.utils';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { type ProductItem, type ProductSku } from '@/services/products.service';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type ProductBuyPanelProps = {
  product: ProductItem;
  vndPerCny: number;
};

/**
 * Everything needed to decide and to buy: source, title, price, stock,
 * variants, quantity, action. Sticky on a laptop so the action stays put
 * while the description scrolls.
 */
export function ProductBuyPanel({ product, vndPerCny }: ProductBuyPanelProps) {
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
  const [qty, setQty] = useState(1);
  const { addToCart, pending, committed } = useAddToCart();

  const source = platformLabel(product.platform);
  const effectivePrice = selectedSku?.priceCny ?? product.priceCny ?? 0;
  const stock = selectedSku
    ? selectedSku.stock
    : product.skus.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
  const hasStockData = product.skus.length > 0;
  const inStock = !hasStockData || stock > 0;
  const totalCny = effectivePrice * qty;

  const handleAddToCart = () =>
    void addToCart({
      itemId: product.itemId,
      providerAlias: product.providerAlias,
      skuId: selectedSku?.id,
      title: product.title,
      image: product.image,
      url: product.url,
      shopId: product.shopId,
      shopName: product.shopName,
      platform: product.platform,
      priceCny: Number(effectivePrice) || 0,
      quantity: qty,
      properties: selectedSku
        ? Object.entries(selectedSku.properties).map(([name, value]) => ({ name, value }))
        : undefined,
    });

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {source && (
          <span className="bg-[var(--manifest-navy)] px-1.5 py-0.5 font-semibold text-white">
            {source}
          </span>
        )}
        {product.shopName && (
          <span className="truncate text-[var(--graphite)]">{product.shopName}</span>
        )}
      </div>

      <h1 className="mt-2 text-lg font-semibold leading-snug text-[var(--ink)] sm:text-xl">
        {product.title}
      </h1>

      <div className="mt-5 border-y border-[var(--rule)] py-4">
        <p data-numeric className="text-3xl font-bold text-[var(--seal-red)]">
          {formatVnd(cnyToVnd(effectivePrice, vndPerCny))}
        </p>
        <p data-numeric className="mt-1 text-sm text-[var(--graphite)]">
          {formatCny(effectivePrice)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-semibold',
              inStock ? 'text-[var(--ledger-green)]' : 'text-[var(--seal-red)]',
            )}
          >
            {inStock ? (
              <Check {...icon('inline')} aria-hidden />
            ) : (
              <Minus {...icon('inline')} aria-hidden />
            )}
            {inStock ? 'Còn hàng' : 'Hết hàng'}
          </span>
          {hasStockData && inStock && (
            <span className="text-[var(--graphite)]">
              Tồn <span data-numeric>{stock.toLocaleString('vi-VN')}</span>
            </span>
          )}
          {product.soldCount ? (
            <span className="text-[var(--graphite)]">
              Đã bán <span data-numeric>{product.soldCount.toLocaleString('vi-VN')}</span>
            </span>
          ) : null}
        </div>
      </div>

      {product.properties && product.properties.length > 0 && (
        <div className="mt-5 space-y-4">
          {product.properties.map((prop) => (
            <fieldset key={prop.name}>
              <legend className="mb-2 text-sm font-semibold text-[var(--ink)]">
                {prop.name}
              </legend>
              <div className="flex flex-wrap gap-2">
                {prop.values.map((v) => {
                  const sku = product.skus.find((s) =>
                    Object.values(s.properties).includes(v.name),
                  );
                  const isSelected = selectedSku?.id === sku?.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => sku && setSelectedSku(isSelected ? null : sku)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                        isSelected
                          ? 'border-[var(--ink)] bg-[var(--ink)] font-medium text-white'
                          : 'border-[var(--rule-strong)] bg-[var(--sheet-white)] text-[var(--ink)] hover:border-[var(--ink)]',
                      )}
                    >
                      {v.image && (
                        <ProductImage src={v.image} fallbackIcon="inline" className="size-5" />
                      )}
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <span className="text-sm font-semibold text-[var(--ink)]">Số lượng</span>
        <QuantityStepper value={qty} onChange={setQty} />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-[var(--rule)] pt-4">
        <span className="text-sm text-[var(--graphite)]">Tạm tính</span>
        <div className="text-right">
          <p data-numeric className="text-xl font-bold text-[var(--ink)]">
            {formatVnd(cnyToVnd(totalCny, vndPerCny))}
          </p>
          <p data-numeric className="text-xs text-[var(--graphite)]">
            {formatCny(totalCny)}
          </p>
        </div>
      </div>

      <Button
        variant="commerce"
        size="lg"
        className={cn(
          'mt-4 w-full',
          committed && 'dock-commit bg-[var(--ledger-green)] hover:bg-[var(--ledger-green)]',
        )}
        onClick={handleAddToCart}
        disabled={pending}
      >
        {pending ? (
          <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
        ) : committed ? (
          <>
            <Check {...icon('inline')} aria-hidden />
            Đã thêm vào giỏ
          </>
        ) : (
          <>
            <ShoppingCart {...icon('inline')} aria-hidden />
            Thêm vào giỏ hàng
          </>
        )}
      </Button>

      <p data-prose className="mt-3 text-xs">
        Giá chưa gồm phí vận chuyển và dịch vụ. Các khoản này tính sau khi hàng về
        kho Việt Nam theo cân nặng thực tế.
      </p>
    </div>
  );
}
