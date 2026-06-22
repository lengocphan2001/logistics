'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ordersService, type CustomerOrderDetail } from '@/services/orders.service';
import { orderTypeLabels } from '@/lib/order-type';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    ordersService
      .getMyById(params.id)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Không tìm thấy đơn hàng'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-accent)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl py-6 text-center">
        <p className="text-[var(--portal-muted)]">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link href="/orders" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-accent)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách đơn hàng
      </Link>

      <div className="rounded-2xl border border-[var(--portal-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--portal-muted)]">
              {orderTypeLabels[order.type as keyof typeof orderTypeLabels]}
            </p>
            <h1 className="mt-1 font-mono text-xl font-bold">{order.billOfLadingCode}</h1>
            <p className="mt-1 text-sm text-[var(--portal-muted)]">
              Tạo lúc {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
          <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
            {orderStatusLabels[order.status]}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--brand-surface-muted)]/60 p-4">
            <p className="text-xs text-[var(--portal-muted)]">Tổng phí</p>
            <p className="mt-1 text-lg font-bold">{formatCny(order.totalFee)}</p>
          </div>
          <div className="rounded-xl bg-[var(--brand-surface-muted)]/60 p-4">
            <p className="text-xs text-[var(--portal-muted)]">Đã cọc</p>
            <p className="mt-1 text-lg font-bold">{formatCny(order.depositAmount)}</p>
          </div>
          <div className="rounded-xl bg-[var(--brand-surface-muted)]/60 p-4">
            <p className="text-xs text-[var(--portal-muted)]">Giá trị khai báo</p>
            <p className="mt-1 text-lg font-bold">{formatCny(order.declaredValue)}</p>
          </div>
        </div>

        {order.events && order.events.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-semibold">Lịch sử trạng thái</h2>
            <ol className="space-y-3 border-l-2 border-[var(--brand-primary)]/25 pl-4">
              {order.events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
                  <p className="text-sm font-medium">{orderStatusLabels[event.status]}</p>
                  {event.note && <p className="text-xs text-[var(--portal-muted)]">{event.note}</p>}
                  <p className="text-[11px] text-[var(--portal-muted)]">
                    {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
