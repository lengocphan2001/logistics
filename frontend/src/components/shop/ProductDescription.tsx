'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

/** Strip scripts and inline event handlers from Taobao HTML descriptions */
function sanitizeProductHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

interface ProductDescriptionProps {
  html?: string;
  className?: string;
}

export function ProductDescription({ html, className }: ProductDescriptionProps) {
  const sanitized = useMemo(() => (html ? sanitizeProductHtml(html) : ''), [html]);

  if (!sanitized.trim()) {
    return (
      <div
        className={cn(
          'border border-dashed border-[var(--rule-strong)] p-6 text-center text-sm text-[var(--graphite)]',
          className,
        )}
      >
        Chưa có mô tả sản phẩm
      </div>
    );
  }

  return (
    <section className={cn('panel', className)}>
      <h2 className="border-b border-[var(--rule)] px-5 py-3 font-heading text-base font-semibold text-[var(--ink)]">
        Mô tả sản phẩm
      </h2>
      {/* Vendor HTML: the measure is capped so paragraphs stay readable, while
          tables and wide imagery keep their own horizontal scroll. */}
      <div
        className="product-description overflow-x-auto p-5 text-sm leading-relaxed text-[var(--graphite)] [&_a]:text-[var(--manifest-navy)] [&_a]:underline [&_div]:max-w-full [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3 [&_p]:max-w-[68ch] [&_table]:w-full [&_td]:p-1.5 [&_th]:p-1.5"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </section>
  );
}
