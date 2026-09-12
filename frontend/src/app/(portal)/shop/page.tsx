'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PackageSearch, Search } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { CategorySidebar } from '@/components/shop/CategorySidebar';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { icon } from '@/lib/icon';
import { DEFAULT_PROVIDER, PROVIDERS } from '@/config/shop.config';
import { cn } from '@/lib/utils';

const SORTS = [
  { field: undefined, label: 'Phổ biến' },
  { field: 'Price', label: 'Giá' },
  { field: 'SalesCount', label: 'Bán chạy' },
];

const PAGE_SIZE = 48; // max 100 per OTAPI cap, 48 = nice 6-col grid

function ShopContent() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') ?? '';

  const { vndPerCny } = useExchangeRate();
  const [keyword, setKeyword] = useState(queryFromUrl);
  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<string>(DEFAULT_PROVIDER);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search submitted from the top bar arrives as ?q=
  useEffect(() => {
    if (!queryFromUrl) return;
    setKeyword(queryFromUrl);
    setInputValue(queryFromUrl);
    setCategoryId(undefined);
    setPage(1);
  }, [queryFromUrl]);

  const queryKey = ['products', 'search', { keyword, categoryId, provider, page, sortField, sortOrder }];

  // OTAPI requires at least keyword or categoryId — skip query if neither is set
  const canSearch = !!(keyword || categoryId);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      productsService.search({
        keyword: keyword || undefined,
        categoryId,
        provider,
        page,
        pageSize: PAGE_SIZE,
        sortField,
        sortOrder,
      }),
    enabled: canSearch,
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const handleSearch = () => {
    setKeyword(inputValue);
    setPage(1);
  };

  const handleCategorySelect = (id: string | undefined) => {
    setCategoryId(id);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="flex gap-6 lg:gap-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-6 overflow-visible">
          <CategorySidebar
            selectedId={categoryId}
            provider={provider}
            onSelect={handleCategorySelect}
          />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Source and ordering sit on one rule above the grid, so the grid
            itself starts clean and the imagery leads. */}
        <div className="flex flex-col gap-3 border-b border-[var(--rule)] pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">Mua hộ Taobao và 1688</h1>
            {canSearch && data && (
              <p className="mt-1 text-sm text-[var(--graphite)]">
                <span data-numeric className="font-semibold text-[var(--ink)]">
                  {data.total.toLocaleString('vi-VN')}
                </span>{' '}
                kết quả
                {keyword ? ` cho “${keyword}”` : ''}
                {isFetching && (
                  <Loader2
                    {...icon('inline')}
                    aria-label="Đang tải"
                    className="ml-2 inline animate-spin align-[-2px]"
                  />
                )}
              </p>
            )}
          </div>

          <div
            role="group"
            aria-label="Nguồn hàng"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 scroll-x-clean sm:mx-0 sm:overflow-visible"
          >
            {PROVIDERS.map((p) => (
              <button
                key={p.alias}
                type="button"
                aria-pressed={provider === p.alias}
                onClick={() => {
                  setProvider(p.alias);
                  setCategoryId(undefined);
                  setPage(1);
                }}
                className={cn(
                  'shrink-0 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                  provider === p.alias
                    ? 'bg-[var(--manifest-navy)] text-white'
                    : 'border border-[var(--rule-strong)] bg-[var(--sheet-white)] text-[var(--graphite)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)]',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-2 lg:max-w-xl">
            <div className="relative min-w-0 flex-1">
              <Search
                {...icon('inline')}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--graphite)]"
              />
              <input
                type="search"
                placeholder="Tìm sản phẩm"
                aria-label="Tìm sản phẩm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--rule-strong)] bg-[var(--sheet-white)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--graphite)]/75 hover:border-[var(--graphite)] focus-visible:border-[var(--manifest-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]"
              />
            </div>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <span className="mr-1 text-[var(--graphite)]">Sắp xếp</span>
            {SORTS.map((s) => (
              <button
                key={s.label}
                type="button"
                aria-pressed={sortField === s.field}
                onClick={() => {
                  setSortField(s.field);
                  setSortOrder('desc');
                  setPage(1);
                }}
                className={cn(
                  'rounded-[var(--radius-control)] px-2.5 py-1.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                  sortField === s.field
                    ? 'font-semibold text-[var(--ink)] underline decoration-2 underline-offset-[6px]'
                    : 'text-[var(--graphite)] hover:text-[var(--ink)]',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {!canSearch ? (
            <EmptyState
              icon={PackageSearch}
              title="Nhập từ khóa để bắt đầu"
              hint="Hoặc chọn một danh mục ở cột bên trái để duyệt theo ngành hàng."
            />
          ) : isLoading ? (
            <LoadingState label="Đang tải sản phẩm" />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Không tìm thấy sản phẩm nào"
              hint="Thử từ khóa ngắn hơn, hoặc đổi nguồn hàng sang 1688."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {data.items.map((product) => (
                  <ProductCard
                    key={`${product.providerAlias}-${product.itemId}`}
                    product={product}
                    vndPerCny={vndPerCny}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Phân trang"
                  className="mt-10 flex items-center justify-center gap-4 border-t border-[var(--rule)] pt-6"
                >
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Trang trước
                  </Button>
                  <span data-numeric className="text-sm text-[var(--graphite)]">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Trang sau
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={<LoadingState />}
    >
      <ShopContent />
    </Suspense>
  );
}
