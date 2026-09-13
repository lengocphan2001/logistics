'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiErrorMessage } from '@/lib/api-error';
import { formatCny, formatVnd } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import {
  ordersService,
  type CustomerOrderSummary,
} from '@/services/orders.service';

type QuotePanelProps = {
  summary: CustomerOrderSummary;
  onDone: (summary: CustomerOrderSummary) => void;
};

/**
 * Shown only while a quote is waiting on the customer. Everything they need to
 * decide is on this one panel: what it costs, what happens to their wallet when
 * they say yes, and how long they have to answer.
 */
export function QuotePanel({ summary, onDone }: QuotePanelProps) {
  const { order, amounts } = summary;
  const { profile, refresh } = useCustomerProfile();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read the clock in an effect, not during render, and keep reading it: the
  // deadline can pass while the customer is still looking at the panel.
  const [expired, setExpired] = useState(false);
  const expiresAt = order.quoteExpiresAt;

  useEffect(() => {
    if (!expiresAt) return;
    const deadline = new Date(expiresAt).getTime();
    const check = () => setExpired(deadline <= Date.now());
    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  // Consignment only ever owes shipping, and shipping is collected when the
  // parcel lands in Vietnam, so approving costs nothing today.
  const chargeNow = order.type === 'CONSIGNMENT' ? 0 : amounts.goodsCny;
  const balance = Number(profile?.balance ?? 0);
  const shortfall = Math.max(0, chargeNow - balance);

  const approve = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await ordersService.approveQuote(order.id);
      onDone(res.data);
      void refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'Không duyệt được báo giá'));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await ordersService.rejectQuote(order.id, reason.trim() || undefined);
      onDone(res.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Không gửi được phản hồi'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-[var(--manifest-navy)] bg-[var(--sheet-white)] p-4 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
        {order.type === 'CONSIGNMENT' ? 'Báo cước vận chuyển' : 'Báo giá đơn hàng'}
      </h2>
      <p data-prose className="mt-1 text-sm">
        Nhân viên đã kiểm tra và gửi số tiền dưới đây. Đơn chỉ được xử lý tiếp
        khi bạn duyệt.
      </p>

      <dl className="mt-4 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
        {order.type !== 'CONSIGNMENT' && (
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-sm text-[var(--graphite)]">Tiền hàng</dt>
            <dd data-numeric className="text-sm text-[var(--ink)]">
              {formatCny(amounts.goodsCny)}
            </dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-[var(--graphite)]">Phí vận chuyển và dịch vụ</dt>
          <dd data-numeric className="text-sm text-[var(--ink)]">
            {formatVnd(amounts.feesVnd)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm font-semibold text-[var(--ink)]">
            Trừ ví khi bạn duyệt
          </dt>
          <dd data-numeric className="text-base font-bold text-[var(--seal-red)]">
            {formatCny(chargeNow)}
          </dd>
        </div>
      </dl>

      {order.quoteNote && (
        <p data-prose className="mt-3 text-sm">
          {order.quoteNote}
        </p>
      )}

      {order.quoteExpiresAt && (
        <p data-numeric className="mt-3 text-sm text-[var(--graphite)]">
          {expired
            ? `Đã hết hạn lúc ${formatDateTime(order.quoteExpiresAt)}`
            : `Có hiệu lực tới ${formatDateTime(order.quoteExpiresAt)}`}
        </p>
      )}

      {order.type !== 'CONSIGNMENT' && (
        <p data-numeric className="mt-1 text-sm text-[var(--graphite)]">
          Số dư ví của bạn: {formatCny(balance)}
        </p>
      )}

      {shortfall > 0 && !expired && (
        <p className="mt-3 border border-[var(--seal-red)] bg-[var(--red-wash)] px-3 py-2 text-sm text-[var(--seal-red)]">
          Ví còn thiếu {formatCny(shortfall)}. Nạp thêm rồi quay lại duyệt.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-[var(--seal-red)]" role="alert">
          {error}
        </p>
      )}

      {expired ? (
        <p data-prose className="mt-4 text-sm">
          Báo giá đã hết hạn. Liên hệ nhân viên để được báo giá lại.
        </p>
      ) : rejecting ? (
        <div className="mt-4 space-y-3">
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do từ chối (không bắt buộc)"
            aria-label="Lý do từ chối báo giá"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" disabled={busy} onClick={() => void reject()}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : 'Gửi từ chối'}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => setRejecting(false)}>
              Quay lại
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {shortfall > 0 ? (
            <Link href="/wallet" className={cn(buttonVariants(), 'inline-flex')}>
              Nạp thêm tiền
            </Link>
          ) : (
            <Button disabled={busy} onClick={() => void approve()}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                'Duyệt báo giá'
              )}
            </Button>
          )}
          <Button variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
            Từ chối
          </Button>
        </div>
      )}
    </section>
  );
}
