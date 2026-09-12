'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { icon } from '@/lib/icon';
import { DEFAULT_PROVIDER } from '@/config/shop.config';
import { LoadingState } from '@/components/ui/loading-state';
import { ProductImage } from '@/components/shop/ProductImage';
import { CategoryFlyout } from '@/components/shop/CategoryFlyout';
import { CATEGORY_STALE_MS } from '@/components/shop/category.constants';
import { productsService, type CategoryInfo } from '@/services/products.service';

interface FlyoutPos {
  x: number;
  y: number;
  parentId: string;
}

interface CategorySidebarProps {
  selectedId?: string;
  provider?: string;
  onSelect: (id: string | undefined) => void;
}

/**
 * Category marks use the real merchandising thumbnail where one exists and a
 * plain initial where it does not. No generated colour wheel: a category is
 * not a status, so it gets no hue.
 */
function CategoryMark({ cat, active }: { cat: CategoryInfo; active: boolean }) {
  if (cat.image) {
    return <ProductImage src={cat.image} fallbackIcon="inline" className="size-7 shrink-0" />;
  }

  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center text-xs font-bold',
        active ? 'bg-white/20 text-white' : 'bg-[var(--wash)] text-[var(--graphite)]',
      )}
    >
      {cat.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function CategorySidebar({
  selectedId,
  provider = DEFAULT_PROVIDER,
  onSelect,
}: CategorySidebarProps) {
  const [flyout, setFlyout] = useState<FlyoutPos | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: roots, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['categories', 'root', provider],
    queryFn: () => productsService.getCategories('0', provider, 30),
    staleTime: CATEGORY_STALE_MS,
    gcTime: CATEGORY_STALE_MS,
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 6000),
  });

  const openFlyout = useCallback((e: React.MouseEvent, cat: CategoryInfo) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const panelHeight = Math.min(window.innerHeight * 0.75, 520);
    const y = Math.min(rect.top, window.innerHeight - panelHeight - 16);
    setFlyout({ x: rect.right, y: Math.max(8, y), parentId: cat.id });
  }, []);

  const scheduledClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setFlyout(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const pickCategory = (id: string) => {
    onSelect(id);
    setFlyout(null);
  };

  if (isLoading) {
    return <LoadingState size="control" className="py-8" label="Đang tải danh mục" />;
  }

  if (isError && !roots?.length) {
    return (
      <div className="panel p-4">
        <div className="flex items-start gap-2">
          <AlertCircle
            {...icon('inline')}
            aria-hidden
            className="mt-0.5 shrink-0 text-[var(--seal-red)]"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink)]">Không tải được danh mục</p>
            <p data-prose className="text-xs">
              OTAPI đang bảo trì hoặc quá tải. Bạn vẫn có thể tìm sản phẩm bằng từ khóa.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--rule-strong)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)] disabled:opacity-50"
            >
              <RefreshCw
                {...icon('inline')}
                aria-hidden
                className={cn('size-3.5', isFetching && 'animate-spin')}
              />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories = roots ?? [];

  return (
    <>
      <div className="panel overflow-hidden">
        <h2 className="border-b border-[var(--rule)] px-3 py-2.5 font-heading text-sm font-semibold text-[var(--ink)]">
          Danh mục
        </h2>

        <nav aria-label="Danh mục sản phẩm">
          {categories.length === 0 ? (
            <p data-prose className="px-3 py-4 text-center text-xs">
              Chưa có danh mục. Dùng ô tìm kiếm phía trên.
            </p>
          ) : null}
          {categories.map((cat) => {
            const isSelected = selectedId === cat.id;
            const active = isSelected || flyout?.parentId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => {
                  onSelect(cat.id);
                  if (!cat.hasChildren) setFlyout(null);
                }}
                onMouseEnter={(e) => (cat.hasChildren ? openFlyout(e, cat) : scheduledClose())}
                onMouseLeave={scheduledClose}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                  active
                    ? 'bg-[var(--manifest-navy)] font-medium text-white'
                    : 'text-[var(--ink)] hover:bg-[var(--wash)]',
                )}
              >
                <CategoryMark cat={cat} active={active} />
                <span className="flex-1 truncate leading-snug">{cat.name}</span>
                {cat.hasChildren && (
                  <ChevronRight
                    {...icon('inline')}
                    aria-hidden
                    className={cn('size-3.5', active ? 'text-white' : 'text-[var(--graphite)]')}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {flyout && (
        <CategoryFlyout
          parentId={flyout.parentId}
          provider={provider}
          x={flyout.x}
          y={flyout.y}
          selectedId={selectedId}
          onSelect={pickCategory}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduledClose}
        />
      )}
    </>
  );
}
