'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

export type OrderItemProperty = {
  name: string;
  value: string;
  nameOriginal?: string;
  valueOriginal?: string;
};

/** `颜色分类: 黑色 / 尺码: XL` — what the shop page actually shows. */
export function formatSourceProperties(properties: OrderItemProperty[]): string {
  return properties
    .filter((p) => p.valueOriginal)
    .map((p) => (p.nameOriginal ? `${p.nameOriginal}: ${p.valueOriginal}` : p.valueOriginal))
    .join(' / ');
}

/**
 * Staff buy on the marketplace itself, where the variant picker is in Chinese.
 * The Vietnamese label above is for reading; this line is for matching, so it
 * is copyable in one click and never translated.
 */
export function SourcePropertyCopy({ properties }: { properties: OrderItemProperty[] }) {
  const [copied, setCopied] = useState(false);
  const text = formatSourceProperties(properties);

  if (!text) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard blocked (insecure origin or denied permission): the text is
      // still on screen and selectable, so there is nothing to recover from.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Sao chép phân loại gốc để dán vào trang sàn"
      className={cn(
        'mt-1 inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-control)] border px-1.5 py-0.5 text-xs',
        copied
          ? 'border-[var(--ledger-green)] text-[var(--ledger-green)]'
          : 'border-[var(--rule-strong)] text-[var(--ink)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)]',
      )}
    >
      {copied ? (
        <Check {...icon('inline')} aria-hidden className="size-3.5 shrink-0" />
      ) : (
        <Copy {...icon('inline')} aria-hidden className="size-3.5 shrink-0" />
      )}
      <span className="truncate font-mono" lang="zh-Hans">
        {text}
      </span>
    </button>
  );
}
