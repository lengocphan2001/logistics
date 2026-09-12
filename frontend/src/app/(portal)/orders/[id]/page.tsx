'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { ordersService, type CustomerOrderDetail } from '@/services/orders.service';
import { ProductImage } from '@/components/shop/ProductImage';
import { orderTypeLabels } from '@/lib/order-type';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
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
        <Loader2 className="h-8 w-8 animate-spin text-[var(--manifest-navy)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-6 text-center">
        <p className="text-[var(--graphite)]">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link href="/orders" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--manifest-navy)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách đơn hàng
      </Link>

      <div className="rounded-[var(--radius-panel)] border border-[var(--rule)] bg-[var(--sheet-white)] p-4  sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--graphite)]">
              {orderTypeLabels[order.type as keyof typeof orderTypeLabels]}
            </p>
            <h1 className="mt-1 break-all font-mono text-lg font-bold sm:text-xl">{order.billOfLadingCode}</h1>
            <p className="mt-1 text-sm text-[var(--graphite)]">
              Tạo lúc {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
            {orderStatusLabels[order.status]}
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-[var(--radius-panel)] bg-[var(--wash)]/60 p-4">
            <p className="text-xs text-[var(--graphite)]">Tổng phí</p>
            <p data-numeric className="mt-1 text-lg font-bold">{formatCny(order.totalFee)}</p>
          </div>
          <div className="rounded-[var(--radius-panel)] bg-[var(--wash)]/60 p-4">
            <p className="text-xs text-[var(--graphite)]">Đã cọc</p>
            <p data-numeric className="mt-1 text-lg font-bold">{formatCny(order.depositAmount)}</p>
          </div>
          <div className="rounded-[var(--radius-panel)] bg-[var(--wash)]/60 p-4">
            <p className="text-xs text-[var(--graphite)]">Giá trị khai báo</p>
            <p data-numeric className="mt-1 text-lg font-bold">{formatCny(order.declaredValue)}</p>
          </div>
        </div>

        {/* Order Items (Mua hộ) */}
        {order.items && order.items.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-heading text-base font-semibold">Sản phẩm đặt mua</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--rule)] p-3">
                  {item.image && (
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      fallbackIcon="control"
                      className="size-16 shrink-0 border border-[var(--rule)]"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium text-[var(--ink)]">{item.title}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[var(--manifest-navy)] hover:underline"
                          title="Xem nguồn"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {item.properties && item.properties.length > 0 && (
                      <p className="mt-0.5 text-xs text-[var(--graphite)]">
                        {item.properties.map((p) => `${p.name}: ${p.value}`).join(', ')}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span data-numeric className="text-[var(--graphite)]">
                        {item.quantity} × ¥{Number(item.priceCny).toFixed(2)}
                      </span>
                      <span data-numeric className="font-bold text-[var(--seal-red)]">
                        ¥{Number(item.totalCny).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end text-sm font-bold text-[var(--seal-red)]">
              Tổng hàng: ¥{order.items.reduce((s, i) => s + Number(i.totalCny), 0).toFixed(2)}
            </div>
          </div>
        )}

        {order.events && order.events.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-heading text-base font-semibold">Lịch sử trạng thái</h2>
            <ol className="space-y-3 border-l-2 border-[var(--manifest-navy)]/25 pl-4">
              {order.events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--manifest-navy)]" />
                  <p className="text-sm font-medium">{orderStatusLabels[event.status]}</p>
                  {event.note && <p className="text-xs text-[var(--graphite)]">{event.note}</p>}
                  <p className="text-[11px] text-[var(--graphite)]">
                    {formatDateTime(event.createdAt)}
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
