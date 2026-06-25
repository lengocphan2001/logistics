'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { CategorySidebar } from '@/components/shop/CategorySidebar';
import { ProductCard } from '@/components/shop/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROVIDERS = [
  { alias: 'p1', label: 'Taobao' },
  { alias: 'p6', label: '1688' },
  { alias: 'p7', label: 'JD.com' },
];

const PAGE_SIZE = 48; // max 100 per OTAPI cap, 48 = nice 6-col grid

export default function ShopPage() {
  const { vndPerCny } = useExchangeRate();
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState('p1');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      {/* Sidebar — mega menu danh mục */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-6 overflow-visible">
          <CategorySidebar
            selectedId={categoryId}
            provider={provider}
            onSelect={handleCategorySelect}
          />
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Mua hộ Taobao / 1688</h1>

          {/* Provider selector */}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {PROVIDERS.map((p) => (
              <button
                key={p.alias}
                onClick={() => {
                  setProvider(p.alias);
                  setCategoryId(undefined);
                  setPage(1);
                }}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  provider === p.alias
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'border border-amber-200 text-amber-700 hover:bg-amber-50',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm sản phẩm trên Taobao, 1688..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 border-amber-200 focus-visible:ring-amber-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Sort */}
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 text-sm scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
          <span className="text-gray-500">Sắp xếp:</span>
          {[
            { field: undefined, label: 'Phổ biến' },
            { field: 'Price', label: 'Giá' },
            { field: 'SalesCount', label: 'Bán chạy' },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => { setSortField(s.field); setSortOrder('desc'); setPage(1); }}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 transition-colors',
                sortField === s.field
                  ? 'bg-amber-100 text-amber-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {!canSearch ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 sm:py-24">
            <Search className="mb-4 h-12 w-12 opacity-20 sm:h-16 sm:w-16" />
            <p className="text-base font-medium text-gray-600">Tìm kiếm sản phẩm Taobao / 1688</p>
            <p className="mt-1 px-4 text-center text-sm">
              Nhập từ khóa hoặc chọn danh mục (màn hình lớn) để bắt đầu
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-base">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm">Thử từ khóa khác hoặc danh mục khác</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {isFetching && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />}
                Hiển thị <strong className="text-gray-700">{data.items.length}</strong> / {data.total.toLocaleString()} sản phẩm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {data.items.map((product) => (
                <ProductCard
                  key={`${product.providerAlias}-${product.itemId}`}
                  product={product}
                  vndPerCny={vndPerCny}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
