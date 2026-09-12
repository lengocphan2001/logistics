'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { LoadingState } from '@/components/ui/loading-state';
import {
  productsService,
  type CategoryFlyoutSection,
} from '@/services/products.service';
import { CATEGORY_STALE_MS } from '@/components/shop/category.constants';
import { cn } from '@/lib/utils';

type CategoryFlyoutProps = {
  parentId: string;
  provider: string;
  /** Viewport position of the row that opened the panel. */
  x: number;
  y: number;
  selectedId?: string;
  onSelect: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

/**
 * Subcategories for one root, rendered in a portal so the panel can overflow
 * the sidebar and the page without a stacking-context fight.
 */
export function CategoryFlyout({
  parentId,
  provider,
  x,
  y,
  selectedId,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: CategoryFlyoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['categories', 'flyout', parentId, provider],
    queryFn: () => productsService.getCategoryFlyout(parentId, provider),
    staleTime: CATEGORY_STALE_MS,
    gcTime: CATEGORY_STALE_MS,
    retry: 1,
  });

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{ left: x, top: y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-h-[75vh] w-[min(780px,calc(100vw-260px))] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--rule)] bg-[var(--sheet-white)] shadow-[var(--lift)]">
        {isLoading || !sections ? (
          <LoadingState size="control" className="py-16" label="Đang tải danh mục con" />
        ) : sections.length === 0 ? (
          <p data-prose className="px-6 py-8 text-sm">
            Không có danh mục con
          </p>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-3">
              {sections.map((section) => (
                <FlyoutSection
                  key={section.id}
                  section={section}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function FlyoutSection({
  section,
  selectedId,
  onSelect,
}: {
  section: CategoryFlyoutSection;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const sectionSelected = selectedId === section.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(section.id)}
        className={cn(
          'mb-2 text-left font-heading text-sm font-semibold hover:underline hover:underline-offset-2',
          sectionSelected ? 'text-[var(--manifest-navy)]' : 'text-[var(--ink)]',
        )}
      >
        {section.name}
      </button>

      {section.items.length > 0 && (
        <ul className="space-y-1.5">
          {section.items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'text-left text-xs leading-relaxed hover:text-[var(--manifest-navy)] hover:underline hover:underline-offset-2',
                    isSelected
                      ? 'font-semibold text-[var(--manifest-navy)]'
                      : 'text-[var(--graphite)]',
                  )}
                >
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
