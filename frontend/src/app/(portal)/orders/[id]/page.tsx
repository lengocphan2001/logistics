'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { ordersService, type CustomerOrderDetail } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
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

        {/* Order Items (Mua hộ) */}
        {order.items && order.items.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-semibold">Sản phẩm đặt mua</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl border border-amber-100 p-3">
                  {item.image && (
                    <img
                      src={productsService.imageProxyUrl(item.image)}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover border border-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium text-gray-800">{item.title}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-amber-600 hover:text-amber-800"
                          title="Xem nguồn"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {item.properties && item.properties.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.properties.map((p) => `${p.name}: ${p.value}`).join(', ')}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span className="text-gray-500">×{item.quantity} · ¥{Number(item.priceCny).toFixed(2)}/cái</span>
                      <span className="font-bold text-amber-700">¥{Number(item.totalCny).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end text-sm font-bold text-amber-700">
              Tổng hàng: ¥{order.items.reduce((s, i) => s + Number(i.totalCny), 0).toFixed(2)}
            </div>
          </div>
        )}

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
