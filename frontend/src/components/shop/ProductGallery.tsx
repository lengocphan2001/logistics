'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/shop/ProductImage';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: string[];
  title: string;
};

/** Square plate for the selected photo, thumbnails beneath it. */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden bg-[var(--sheet-white)]">
        <ProductImage src={current} alt={title} fit="contain" loading="eager" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-x-clean">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              aria-label={`Ảnh ${i + 1}`}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                'size-16 shrink-0 overflow-hidden border-2 bg-[var(--sheet-white)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                i === selected
                  ? 'border-[var(--ink)]'
                  : 'border-transparent hover:border-[var(--rule-strong)]',
              )}
            >
              <ProductImage src={img} fallbackIcon="inline" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
