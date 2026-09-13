'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ProductImage } from '@/components/shop/ProductImage';
import { ReorderButton } from '@/components/portal/ReorderButton';
import { OrderProgress } from '@/components/portal/orders/OrderProgress';
import { QuotePanel } from '@/components/portal/orders/QuotePanel';
import { apiErrorMessage } from '@/lib/api-error';
import { orderTypeLabels } from '@/lib/order-type';
import { orderStatusBadgeColors } from '@/lib/order-status';
import { formatCny, formatVnd } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import {
  ordersService,
  orderItemStatusLabels,
  type CustomerOrderSummary,
} from '@/services/orders.service';

/** Khách tự huỷ được khi đơn chưa được nhân viên xử lý. */
const CANCELLABLE = ['NEW_REQUEST', 'QUOTED', 'AWAITING_CN_ARRIVAL'];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [summary, setSummary] = useState<CustomerOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { refresh: refreshProfile } = useCustomerProfile();

  useEffect(() => {
    if (!params.id) return;
    ordersService
      .getSummary(params.id)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(apiErrorMessage(err, 'Không tìm thấy đơn hàng')))
      .finally(() => setLoading(false));
  }, [params.id]);

  const cancel = async () => {
    if (!summary) return;
    setCancelling(true);
    try {
      const res = await ordersService.cancel(summary.order.id);
      setSummary(res.data);
      setConfirmCancel(false);
      void refreshProfile();
    } catch (err) {
      setError(apiErrorMessage(err, 'Không huỷ được đơn hàng'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải đơn hàng" className="py-24" />;
  }

  if (error && !summary) {
    return (
      <div className="py-6 text-center">
        <p className="text-[var(--graphite)]">{error}</p>
        <Link
          href="/orders"
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex')}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!summary) return null;

  const { order, amounts, flow, statusLabel } = summary;
  const awaitingQuote = order.status === 'QUOTED' && !order.quoteApprovedAt;
  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <div className="space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--manifest-navy)] hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Danh sách đơn hàng
      </Link>

      <div className="border border-[var(--rule)] bg-[var(--sheet-white)] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-[var(--graphite)]">
              {orderTypeLabels[order.type as keyof typeof orderTypeLabels]}
            </p>
            <h1 className="mt-1 break-all font-mono text-lg font-bold sm:text-xl">
              {order.billOfLadingCode}
            </h1>
            <p data-numeric className="mt-1 text-sm text-[var(--graphite)]">
              Tạo lúc {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
              {statusLabel}
            </Badge>
            <ReorderButton order={order} />
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="bg-[var(--wash)]/60 p-4">
            <dt className="text-xs text-[var(--graphite)]">Tiền hàng</dt>
            <dd data-numeric className="mt-1 text-lg font-bold">
              {formatCny(amounts.goodsCny)}
            </dd>
          </div>
          <div className="bg-[var(--wash)]/60 p-4">
            <dt className="text-xs text-[var(--graphite)]">Phí vận chuyển</dt>
            <dd data-numeric className="mt-1 text-lg font-bold">
              {formatVnd(amounts.feesVnd)}
            </dd>
          </div>
          <div className="bg-[var(--wash)]/60 p-4">
            <dt className="text-xs text-[var(--graphite)]">
              {amounts.dueCny > 0 ? 'Còn phải trả' : 'Đã thanh toán'}
            </dt>
            <dd
              data-numeric
              className={
                amounts.dueCny > 0
                  ? 'mt-1 text-lg font-bold text-[var(--seal-red)]'
                  : 'mt-1 text-lg font-bold text-[var(--ledger-green)]'
              }
            >
              {formatCny(amounts.dueCny > 0 ? amounts.dueCny : amounts.paidCny)}
            </dd>
          </div>
        </dl>

        {(order.sourceOrderCode || order.sourceTrackingCode) && (
          <dl className="mt-4 grid gap-3 border-t border-[var(--rule)] pt-4 sm:grid-cols-2">
            {order.sourceOrderCode && (
              <div>
                <dt className="text-xs text-[var(--graphite)]">Mã đơn trên sàn</dt>
                <dd data-numeric className="text-sm font-semibold">
                  {order.sourceOrderCode}
                </dd>
              </div>
            )}
            {order.sourceTrackingCode && (
              <div>
                <dt className="text-xs text-[var(--graphite)]">
                  Mã vận đơn nội địa Trung Quốc
                </dt>
                <dd data-numeric className="text-sm font-semibold">
                  {order.sourceTrackingCode}
                </dd>
              </div>
            )}
          </dl>
        )}

        {order.items && order.items.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-heading text-base font-semibold">Sản phẩm</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border border-[var(--rule)] p-3"
                >
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
                      <p className="line-clamp-2 text-sm font-medium text-[var(--ink)]">
                        {item.title}
                      </p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[var(--manifest-navy)] hover:underline"
                          aria-label="Xem nguồn"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                      )}
                    </div>
                    {item.properties && item.properties.length > 0 && (
                      <p className="mt-0.5 text-xs text-[var(--graphite)]">
                        {item.properties.map((p) => `${p.name}: ${p.value}`).join(', ')}
                      </p>
                    )}
                    {item.status && item.status !== 'PENDING' && (
                      <p
                        className={
                          item.status === 'OUT_OF_STOCK'
                            ? 'mt-1 text-xs text-[var(--seal-red)]'
                            : 'mt-1 text-xs text-[var(--graphite)]'
                        }
                      >
                        {orderItemStatusLabels[item.status]}
                        {item.statusNote ? ` — ${item.statusNote}` : ''}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span data-numeric className="text-[var(--graphite)]">
                        {item.quantity} ×{' '}
                        {formatCny(Number(item.purchasedPriceCny ?? item.priceCny))}
                      </span>
                      <span data-numeric className="font-bold text-[var(--ink)]">
                        {formatCny(
                          Number(item.purchasedPriceCny ?? item.priceCny) *
                            item.quantity,
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {canCancel && (
          <div className="mt-8 border-t border-[var(--rule)] pt-4">
            {confirmCancel ? (
              <div className="flex flex-wrap items-center gap-2">
                <p data-prose className="text-sm">
                  Huỷ đơn này? Số tiền đã thu sẽ hoàn về ví.
                </p>
                <Button
                  variant="destructive"
                  disabled={cancelling}
                  onClick={() => void cancel()}
                >
                  {cancelling ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    'Xác nhận huỷ'
                  )}
                </Button>
                <Button
                  variant="outline"
                  disabled={cancelling}
                  onClick={() => setConfirmCancel(false)}
                >
                  Không huỷ
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirmCancel(true)}>
                Huỷ đơn hàng
              </Button>
            )}
            {error && (
              <p className="mt-2 text-sm text-[var(--seal-red)]" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {awaitingQuote && <QuotePanel summary={summary} onDone={setSummary} />}

      <OrderProgress
        flow={flow}
        currentStatus={order.status}
        events={order.events ?? []}
      />

      {order.events && order.events.length > 0 && (
        <section className="border border-[var(--rule)] bg-[var(--sheet-white)] p-4 sm:p-6">
          <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
            Lịch sử cập nhật
          </h2>
          <ol className="mt-4 space-y-3">
            {order.events.map((event) => (
              <li key={event.id}>
                <p className="text-sm text-[var(--ink)]">{event.note ?? statusLabel}</p>
                <p data-numeric className="text-xs text-[var(--graphite)]">
                  {formatDateTime(event.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
