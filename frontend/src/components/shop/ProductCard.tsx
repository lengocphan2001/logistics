'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productsService, type ProductItem } from '@/services/products.service';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
import {
  platformBadge,
  ProductMetaRow,
  ProductPriceBlock,
} from '@/components/shop/product-display.utils';

interface ProductCardProps {
  product: ProductItem;
  vndPerCny: number;
  className?: string;
}

export function ProductCard({ product, vndPerCny, className }: ProductCardProps) {
  const invalidate = useCartStore((s) => s.invalidate);
  const [imgError, setImgError] = useState(false);
  const badge = platformBadge(product.platform);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartService.upsertItem({
        itemId: product.itemId,
        providerAlias: product.providerAlias,
        title: product.title,
        image: product.image || undefined,
        url: product.url,
        shopId: product.shopId || undefined,
        shopName: product.shopName || undefined,
        platform: product.platform,
        priceCny: Number(product.priceCny) || 0,
        quantity: 1,
      });
      invalidate();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response
        ?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Không thể thêm vào giỏ hàng');
    }
  };

  const proxyUrl = product.image ? productsService.imageProxyUrl(product.image) : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <button
        type="button"
        onClick={handleAddToCart}
        className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 active:scale-95"
        title="Thêm vào giỏ"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>

      <Link href={`/shop/${product.providerAlias}/${product.itemId}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          {badge && (
            <span
              className={cn(
                'absolute left-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white',
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}

          {proxyUrl && !imgError ? (
            <img
              src={proxyUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-10 w-10 text-gray-200" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-gray-800">
            {product.title}
          </p>

          <ProductPriceBlock
            priceCny={Number(product.priceCny)}
            originalPriceCny={product.originalPriceCny}
            vndPerCny={vndPerCny}
            compact
          />

          <ProductMetaRow rating={product.rating} soldCount={product.soldCount} />
        </div>
      </Link>
    </div>
  );
}
