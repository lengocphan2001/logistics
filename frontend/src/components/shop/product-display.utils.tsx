import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';
import type { ProductItem } from '@/services/products.service';

const PLATFORM_LABEL: Record<string, { label: string; className: string }> = {
  taobao: { label: 'Taobao', className: 'bg-orange-500' },
  '1688': { label: '1688', className: 'bg-red-600' },
  jd: { label: 'JD', className: 'bg-red-500' },
  alibaba: { label: 'Alibaba', className: 'bg-orange-600' },
};

export function platformBadge(platform?: string) {
  if (!platform) return null;
  return PLATFORM_LABEL[platform] ?? { label: platform, className: 'bg-gray-600' };
}

export function ProductPriceBlock({
  priceCny,
  originalPriceCny,
  vndPerCny,
  compact = false,
}: {
  priceCny: number;
  originalPriceCny?: number;
  vndPerCny: number;
  compact?: boolean;
}) {
  const vnd = cnyToVnd(priceCny, vndPerCny);
  const originalVnd =
    originalPriceCny && originalPriceCny > priceCny
      ? cnyToVnd(originalPriceCny, vndPerCny)
      : null;

  return (
    <div className={cn('space-y-0.5', compact && 'space-y-0')}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
        <span className={cn('font-bold text-rose-600', compact ? 'text-sm' : 'text-base')}>
          {formatVnd(vnd)}
        </span>
        {originalVnd != null && (
          <span className="text-xs text-gray-400 line-through">{formatVnd(originalVnd)}</span>
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 text-xs text-gray-600">
        <span className="font-semibold">{formatCny(priceCny)}</span>
        {originalPriceCny != null && originalPriceCny > priceCny && (
          <span className="text-gray-400 line-through">{formatCny(originalPriceCny)}</span>
        )}
      </div>
    </div>
  );
}

export function ProductMetaRow({
  rating,
  soldCount,
}: {
  rating?: number;
  soldCount?: number;
}) {
  if (!rating && !soldCount) return null;
  const displayRating = rating ? Math.min(5, Math.max(1, Math.round(rating))) : null;

  return (
    <div className="flex items-center justify-between text-xs text-gray-500">
      {displayRating ? (
        <span className="inline-flex items-center gap-0.5">
          <span className="font-medium text-gray-700">{displayRating}</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        </span>
      ) : (
        <span />
      )}
      {soldCount ? <span>Đã bán {Number(soldCount).toLocaleString('vi-VN')}</span> : null}
    </div>
  );
}

export function getShopKey(item: { shopId?: string | null; shopName?: string | null }) {
  return item.shopId || item.shopName || '__unknown__';
}

export function formatProperties(
  properties?: { name: string; value: string }[] | null,
): string {
  if (!properties?.length) return '';
  return properties.map((p) => `${p.value}`).join(' ; ');
}
