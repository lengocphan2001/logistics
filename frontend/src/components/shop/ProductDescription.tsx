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
      <div className={cn('rounded-xl border border-amber-100 bg-white p-6 text-center text-sm text-gray-400', className)}>
        Chưa có mô tả sản phẩm
      </div>
    );
  }

  return (
    <section className={cn('rounded-xl border border-amber-100 bg-white shadow-sm', className)}>
      <div className="border-b border-amber-100 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Mô tả sản phẩm
        </h2>
      </div>
      <div
        className="product-description overflow-x-auto p-5 text-sm leading-relaxed text-gray-700 [&_a]:text-amber-700 [&_a]:underline [&_div]:max-w-full [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-2 [&_table]:w-full [&_td]:p-1 [&_th]:p-1"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </section>
  );
}
