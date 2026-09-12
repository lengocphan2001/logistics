import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { icon } from '@/lib/icon';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';

const PLATFORM_LABEL: Record<string, string> = {
  taobao: 'Taobao',
  '1688': '1688',
  jd: 'JD',
  alibaba: 'Alibaba',
};

/**
 * Source marketplace. It is a provenance label, not a status, so it stays in
 * the structural navy rather than taking a colour of its own.
 */
export function platformLabel(platform?: string) {
  if (!platform) return null;
  return PLATFORM_LABEL[platform] ?? platform;
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
  const discounted = originalPriceCny != null && originalPriceCny > priceCny;
  const originalVnd = discounted ? cnyToVnd(originalPriceCny!, vndPerCny) : null;
  const cutPercent = discounted
    ? Math.round(((originalPriceCny! - priceCny) / originalPriceCny!) * 100)
    : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        data-numeric
        className={cn(
          'font-bold text-[var(--seal-red)]',
          compact ? 'text-[0.9375rem]' : 'text-xl',
        )}
      >
        {formatVnd(vnd)}
      </span>

      <span data-numeric className="text-xs font-medium text-[var(--graphite)]">
        {formatCny(priceCny)}
      </span>

      {originalVnd != null && (
        <span
          data-numeric
          className="text-xs text-[var(--graphite)]/70 line-through"
        >
          {formatVnd(originalVnd)}
        </span>
      )}

      {cutPercent >= 1 && (
        <span
          data-numeric
          className="rounded-[2px] bg-[var(--red-wash)] px-1 text-[10px] font-bold text-[var(--seal-red)]"
        >
          −{cutPercent}%
        </span>
      )}
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
    <div className="flex items-center justify-between text-xs text-[var(--graphite)]">
      {displayRating ? (
        <span className="inline-flex items-center gap-1">
          <Star
            {...icon('inline')}
            aria-hidden
            className="size-3.5 fill-current text-[var(--manifest-navy)]"
          />
          <span data-numeric className="font-medium text-[var(--ink)]">
            {displayRating}
          </span>
        </span>
      ) : (
        <span />
      )}
      {soldCount ? (
        <span>
          Đã bán{' '}
          <span data-numeric>{Number(soldCount).toLocaleString('vi-VN')}</span>
        </span>
      ) : null}
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
