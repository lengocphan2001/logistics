'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  productsService,
  type CategoryFlyoutSection,
  type CategoryInfo,
} from '@/services/products.service';

const PALETTE = [
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
];

const color = (idx: number) => PALETTE[idx % PALETTE.length];

interface FlyoutPos {
  x: number;
  y: number;
  parentId: string;
  parentName: string;
}

interface CategorySidebarProps {
  selectedId?: string;
  provider?: string;
  onSelect: (id: string | undefined) => void;
}

function CategoryIcon({ cat, idx, active }: { cat: CategoryInfo; idx: number; active: boolean }) {
  const c = color(idx);
  const imgUrl = cat.image ? productsService.imageProxyUrl(cat.image) : null;

  if (imgUrl) {
    return (
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md',
          active ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white',
        )}
      >
        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold',
        active ? 'bg-white/20 text-white' : `${c.bg} ${c.text}`,
      )}
    >
      {cat.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function CategorySidebar({ selectedId, provider = 'p1', onSelect }: CategorySidebarProps) {
  const [flyout, setFlyout] = useState<FlyoutPos | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: roots, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['categories', 'root', provider],
    queryFn: () => productsService.getCategories('0', provider, 30),
    staleTime: 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 6000),
  });

  const { data: flyoutSections, isLoading: flyoutLoading } = useQuery({
    queryKey: ['categories', 'flyout', flyout?.parentId, provider],
    queryFn: () => productsService.getCategoryFlyout(flyout!.parentId, provider),
    enabled: !!flyout?.parentId,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const openFlyout = useCallback((e: React.MouseEvent, cat: CategoryInfo) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const panelHeight = Math.min(window.innerHeight * 0.75, 520);
    const y = Math.min(rect.top, window.innerHeight - panelHeight - 16);
    setFlyout({
      x: rect.right,
      y: Math.max(8, y),
      parentId: cat.id,
      parentName: cat.name,
    });
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
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
      </div>
    );
  }

  if (isError && !roots?.length) {
    return (
      <div className="overflow-hidden rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-2 text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">Không tải được danh mục</p>
            <p className="text-xs text-amber-700/90">
              OTAPI đang bảo trì hoặc quá tải. Bạn vẫn có thể tìm sản phẩm bằng từ khóa.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header — light blue bar like reference */}
        <div className="flex items-center gap-2 bg-sky-100 px-3 py-2.5 text-sky-900">
          <Menu className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">Danh mục</span>
        </div>

        <nav className="py-1">
          {categories.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              Chưa có danh mục — dùng ô tìm kiếm phía trên
            </p>
          ) : null}
          {categories.map((cat, idx) => {
            const isSelected = selectedId === cat.id;
            const isFlyoutOpen = flyout?.parentId === cat.id;
            const active = isSelected || isFlyoutOpen;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelect(cat.id);
                  if (!cat.hasChildren) setFlyout(null);
                }}
                onMouseEnter={(e) => (cat.hasChildren ? openFlyout(e, cat) : scheduledClose())}
                onMouseLeave={scheduledClose}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-red-600 font-medium text-white'
                    : 'text-gray-800 hover:bg-red-600 hover:text-white',
                )}
              >
                <CategoryIcon cat={cat} idx={idx} active={active} />
                <span className="flex-1 truncate leading-snug">{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {mounted &&
        flyout &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{ left: flyout.x, top: flyout.y }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduledClose}
          >
            <div className="ml-0 w-[min(780px,calc(100vw-240px))] max-h-[75vh] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
              {flyoutLoading || !flyoutSections ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : flyoutSections.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-400">Không có danh mục con</p>
              ) : (
                <div className="max-h-[75vh] overflow-y-auto p-5">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-3">
                    {flyoutSections.map((section) => (
                      <FlyoutSection
                        key={section.id}
                        section={section}
                        selectedId={selectedId}
                        onSelect={pickCategory}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
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

  if (!section.items.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onSelect(section.id)}
          className={cn(
            'text-left text-sm font-bold transition-colors hover:text-red-600',
            sectionSelected ? 'text-red-600' : 'text-gray-900',
          )}
        >
          {section.name}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(section.id)}
        className={cn(
          'mb-2 text-left text-sm font-bold transition-colors hover:text-red-600',
          sectionSelected ? 'text-red-600' : 'text-gray-900',
        )}
      >
        {section.name}
      </button>
      <ul className="space-y-1">
        {section.items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'text-left text-xs leading-relaxed transition-colors hover:text-red-600',
                  isSelected ? 'font-medium text-red-600' : 'text-gray-600',
                )}
              >
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
