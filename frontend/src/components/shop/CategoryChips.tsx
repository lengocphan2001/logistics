'use client';

import { useQuery } from '@tanstack/react-query';
import { CATEGORY_STALE_MS } from '@/components/shop/category.constants';
import { productsService } from '@/services/products.service';
import { cn } from '@/lib/utils';

type CategoryChipsProps = {
  selectedId?: string;
  provider: string;
  onSelect: (id: string | undefined) => void;
};

/**
 * Below the laptop breakpoint there is no room for the category column or its
 * hover flyouts, so the root categories become one scrolling row of chips.
 * Shares the sidebar's query key, so switching widths costs no extra request.
 */
export function CategoryChips({ selectedId, provider, onSelect }: CategoryChipsProps) {
  const { data: roots = [] } = useQuery({
    queryKey: ['categories', 'root', provider],
    queryFn: () => productsService.getCategories('0', provider, 30),
    staleTime: CATEGORY_STALE_MS,
    gcTime: CATEGORY_STALE_MS,
    retry: 2,
  });

  if (roots.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Danh mục sản phẩm"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scroll-x-clean sm:-mx-6 sm:px-6"
    >
      {roots.map((cat) => {
        const active = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? undefined : cat.id)}
            className={cn(
              'shrink-0 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
              active
                ? 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white'
                : 'border-[var(--rule-strong)] bg-[var(--sheet-white)] text-[var(--graphite)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)]',
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
