'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Inbox, Loader2, Search } from 'lucide-react';
import { ordersService, type CustomerOrder } from '@/services/orders.service';
import { ORDER_TYPES, orderTypeLabels, type OrderType } from '@/lib/order-type';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

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
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">Đơn hàng</p>
        <h1 className="mt-1 text-2xl font-bold">{trackMode ? 'Tra cứu vận đơn' : 'Danh sách đơn hàng'}</h1>
        <p className="mt-1 text-sm text-[var(--portal-muted)]">
          Theo dõi trạng thái, phí và tiến độ xử lý đơn hàng của bạn
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveType('ALL')}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              activeType === 'ALL'
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-hero-text)]'
                : 'border-[var(--portal-border)] bg-white text-[var(--portal-body)] hover:border-[var(--brand-primary)]/40',
            )}
          >
            Tất cả
          </button>
          {ORDER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                activeType === type
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-hero-text)]'
                  : 'border-[var(--portal-border)] bg-white text-[var(--portal-body)] hover:border-[var(--brand-primary)]/40',
              )}
            >
              {orderTypeLabels[type]}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--portal-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã vận đơn..."
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--portal-border)] bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--brand-accent)]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-[var(--portal-muted)]">
            <Inbox className="h-10 w-10 opacity-40" />
            <p className="text-sm">Không có đơn hàng phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--brand-surface-muted)]/60 hover:bg-[var(--brand-surface-muted)]/60">
                  <TableHead>Mã vận đơn</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Tổng phí</TableHead>
                  <TableHead className="text-right">Đã cọc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-semibold">{order.billOfLadingCode}</TableCell>
                    <TableCell className="text-sm">{orderTypeLabels[order.type]}</TableCell>
                    <TableCell className="text-sm text-[var(--portal-muted)]">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCny(order.totalFee)}</TableCell>
                    <TableCell className="text-right">{formatCny(order.depositAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      >
                        Chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-accent)]" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
