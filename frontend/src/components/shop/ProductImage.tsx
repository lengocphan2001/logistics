'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { icon, type IconSize } from '@/lib/icon';
import { cn } from '@/lib/utils';

type ProductImageProps = {
  /** Raw marketplace URL; routed through the proxy when needed. */
  src?: string | null;
  alt?: string;
  /** `cover` crops to the square plate, `contain` shows the whole photo. */
  fit?: 'cover' | 'contain';
  /** Size of the placeholder icon when there is no usable image. */
  fallbackIcon?: IconSize;
  loading?: 'lazy' | 'eager';
  className?: string;
};

/**
 * Marketplace imagery fails often — dead CDN links, hotlink blocks. One
 * component owns the proxy URL and the fallback so every surface degrades the
 * same way instead of leaving a broken-image glyph behind.
 */
export function ProductImage({
  src,
  alt = '',
  fit = 'cover',
  fallbackIcon = 'page',
  loading = 'lazy',
  className,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const url = src ? productsService.imageProxyUrl(src) : null;

  if (!url || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-[var(--wash)] text-[var(--rule-strong)]',
          className,
        )}
      >
        <ImageOff {...icon(fallbackIcon)} aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- marketplace CDNs are not in next.config remotePatterns
    <img
      src={url}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={cn(
        'h-full w-full',
        fit === 'cover' ? 'object-cover' : 'object-contain',
        className,
      )}
    />
  );
}
