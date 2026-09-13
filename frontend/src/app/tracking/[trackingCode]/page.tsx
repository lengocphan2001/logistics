'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { trackingService } from '@/services/tracking.service';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { orderTypeLabels } from '@/lib/order-type';
import { formatDateTime } from '@/lib/date';

/**
 * Public page: no sign-in, because the point of a tracking code is that the
 * person holding it can use it.
 */
export default function TrackingPage() {
  const params = useParams() as { trackingCode: string };
  const code = decodeURIComponent(params.trackingCode ?? '');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tracking', code],
    queryFn: async () => (await trackingService.lookup(code)).data,
    enabled: !!code,
    retry: false,
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-[var(--manifest-navy)] hover:underline hover:underline-offset-4"
      >
        Taman Logistics
      </Link>

      <h1 className="mt-4 text-xl font-bold text-[var(--ink)] sm:text-2xl">
        Tra cứu vận đơn
      </h1>
      <p className="mt-1 font-mono text-sm text-[var(--graphite)]">{code}</p>

      <div className="mt-6">
        {isLoading ? (
          <LoadingState label="Đang tra cứu" />
        ) : isError || !data ? (
          <EmptyState
            icon={PackageSearch}
            title="Không tìm thấy vận đơn"
            hint="Kiểm tra lại mã, hoặc liên hệ nhân viên hỗ trợ nếu bạn chắc chắn mã đúng."
          >
            <Button render={<Link href="/" />}>Về trang chủ</Button>
          </EmptyState>
        ) : (
          <>
            <div className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline" className={orderStatusBadgeColors[data.status]}>
                  {orderStatusLabels[data.status]}
                </Badge>
                <span className="text-sm text-[var(--graphite)]">
                  {orderTypeLabels[data.type]}
                </span>
              </div>

              <dl className="mt-4 space-y-2 border-t border-[var(--rule)] pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-[var(--graphite)]">Ngày tạo</dt>
                  <dd data-numeric>{formatDateTime(data.createdAt)}</dd>
                </div>
                {data.warehouse && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--graphite)]">Kho xử lý</dt>
                    <dd>{data.warehouse.name}</dd>
                  </div>
                )}
                {data.receiverProvince && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--graphite)]">Nơi nhận</dt>
                    <dd>{data.receiverProvince}</dd>
                  </div>
                )}
                {data.deliveredAt && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--graphite)]">Đã giao</dt>
                    <dd data-numeric>{formatDateTime(data.deliveredAt)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <section className="panel mt-5 p-5">
              <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
                Hành trình
              </h2>

              {data.events.length === 0 ? (
                <p data-prose className="mt-3 text-sm">
                  Chưa có cập nhật nào cho vận đơn này.
                </p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {data.events.map((event, i) => (
                    <li
                      key={`${event.createdAt}-${i}`}
                      className="border-l-2 border-[var(--manifest-navy)] pl-4"
                    >
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {orderStatusLabels[event.status]}
                      </p>
                      {event.location && (
                        <p className="text-xs text-[var(--graphite)]">{event.location}</p>
                      )}
                      <p data-numeric className="text-xs text-[var(--graphite)]">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
