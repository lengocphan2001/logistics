'use client';

import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { icon } from '@/lib/icon';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { type ProductItem } from '@/services/products.service';
import { ProductImage } from '@/components/shop/ProductImage';
import {
  platformLabel,
  ProductMetaRow,
  ProductPriceBlock,
} from '@/components/shop/product-display.utils';

interface ProductCardProps {
  product: ProductItem;
  vndPerCny: number;
  className?: string;
}

/**
 * The tile has no frame of its own. The photograph sits on a white plate
 * against the grey page, and the text hangs below it on the page ground —
 * so the picture, not a border, is what separates one product from the next.
 */
export function ProductCard({ product, vndPerCny, className }: ProductCardProps) {
  const { addToCart, committed } = useAddToCart();
  const platform = platformLabel(product.platform);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void addToCart({
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
  };

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link
        href={`/shop/${product.providerAlias}/${product.itemId}`}
        className="flex flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--sheet-white)]">
          <ProductImage src={product.image} alt={product.title} />

          {platform && (
            <span className="absolute left-0 top-0 bg-[var(--manifest-navy)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {platform}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 pt-2.5">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[0.8125rem] font-medium leading-snug text-[var(--ink)] group-hover:underline group-hover:underline-offset-2">
            {product.title}
          </h3>

          <ProductPriceBlock
            priceCny={Number(product.priceCny)}
            originalPriceCny={product.originalPriceCny}
            vndPerCny={vndPerCny}
            compact
          />

          <ProductMetaRow rating={product.rating} soldCount={product.soldCount} />
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={`Thêm ${product.title} vào giỏ hàng`}
        className={cn(
          'absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-[var(--radius-control)] text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
          committed
            ? 'dock-commit bg-[var(--ledger-green)]'
            : 'bg-[var(--seal-red)] hover:bg-[#8f0f1f]',
        )}
      >
        {committed ? (
          <Check {...icon('control')} aria-hidden />
        ) : (
          <Plus {...icon('control')} aria-hidden />
        )}
      </button>
    </article>
  );
}
