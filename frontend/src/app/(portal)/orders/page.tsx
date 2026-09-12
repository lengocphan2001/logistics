'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { ordersService, type CustomerOrder } from '@/services/orders.service';
import { ORDER_TYPES, orderTypeLabels, type OrderType } from '@/lib/order-type';
import { icon } from '@/lib/icon';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { OrderTable } from '@/components/portal/OrderTable';

const FILTERS: { value: OrderType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  ...ORDER_TYPES.map((type) => ({ value: type, label: orderTypeLabels[type] })),
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as OrderType | null;
  const trackMode = searchParams.get('track') === '1';

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<OrderType | 'ALL'>(typeParam || 'ALL');

  useEffect(() => {
    if (typeParam && ORDER_TYPES.includes(typeParam)) {
      setActiveType(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    setLoading(true);
    ordersService
      .getMine({
        page: 1,
        limit: 50,
        type: activeType === 'ALL' ? undefined : activeType,
        search: search.trim() || undefined,
      })
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [activeType, search]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={trackMode ? 'Tra cứu vận đơn' : 'Danh sách đơn hàng'}
        description="Theo dõi trạng thái, phí và tiến độ xử lý đơn hàng của bạn."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Lọc theo loại đơn"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scroll-x-clean sm:flex-wrap sm:overflow-visible sm:pb-0"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveType(filter.value)}
              aria-pressed={activeType === filter.value}
              className={cn(
                'shrink-0 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium',
                activeType === filter.value
                  ? 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white'
                  : 'border-[var(--rule-strong)] bg-[var(--sheet-white)] text-[var(--graphite)] hover:border-[var(--manifest-navy)] hover:text-[var(--manifest-navy)]',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search
            {...icon('inline')}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--graphite)]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã vận đơn"
            aria-label="Tìm mã vận đơn"
            className="pl-9"
          />
        </div>
      </div>

      <div className="panel md:overflow-hidden">
        <OrderTable
          orders={orders}
          loading={loading}
          showType
          emptyTitle="Không có đơn hàng phù hợp"
        />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrdersContent />
    </Suspense>
  );
}
