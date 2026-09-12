'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OPTIONAL_SERVICES } from '@/config/shop.config';
import { formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

interface CheckoutSummaryProps {
  goodsTotalVnd: number;
  serviceFeeVnd: number;
  grandTotalVnd: number;
  services: Record<string, boolean>;
  onServiceToggle: (id: string, checked: boolean) => void;
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function CheckoutSummary({
  goodsTotalVnd,
  serviceFeeVnd,
  grandTotalVnd,
  services,
  onServiceToggle,
  agreed,
  onAgreedChange,
  submitting,
  onSubmit,
}: CheckoutSummaryProps) {
  const pendingLabel = 'Tính sau';

  return (
    /* One panel, not three. Costs, options and the commit action belong to a
       single decision, so they share a single frame. */
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="panel overflow-hidden">
        <div className="border-b border-[var(--rule)] px-5 py-4">
          <h2 className="font-heading text-base font-semibold text-[var(--ink)]">Tổng đơn</h2>
          <p data-numeric className="mt-1 text-2xl font-bold text-[var(--seal-red)]">
            {formatVnd(grandTotalVnd)}
          </p>
        </div>

        <dl className="space-y-2.5 px-5 py-4 text-sm">
          <SummaryRow label="Tiền hàng" value={formatVnd(goodsTotalVnd)} />
          <SummaryRow label="Phí mua hộ" value={formatVnd(serviceFeeVnd)} />
          <SummaryRow label="Ship nội địa Trung Quốc" value={pendingLabel} pending />
          <SummaryRow label="Ship quốc tế Trung Việt" value={pendingLabel} pending />
          <SummaryRow label="Ship nội địa Việt Nam" value={pendingLabel} pending />
        </dl>

        <div className="border-t border-[var(--rule)] px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">Dịch vụ tuỳ chọn</h3>
          <div className="space-y-2.5">
            {OPTIONAL_SERVICES.map((svc) => (
              <label
                key={svc.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--graphite)]"
              >
                <Checkbox
                  checked={!!services[svc.id]}
                  onCheckedChange={(v) => onServiceToggle(svc.id, v === true)}
                />
                {svc.label}
              </label>
            ))}
          </div>
          <p data-prose className="mt-3 text-xs">
            Khoản ghi “Tính sau” được chốt khi hàng về kho Việt Nam, theo cân nặng
            thực tế và bảng giá dịch vụ.
          </p>
        </div>

        <div className="border-t border-[var(--rule)] bg-[var(--wash)]/60 px-5 py-4">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Phải trả hôm nay</span>
            <span data-numeric className="text-xl font-bold text-[var(--ink)]">
              {formatVnd(grandTotalVnd)}
            </span>
          </div>

          <label className="mb-3 flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => onAgreedChange(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-snug text-[var(--graphite)]">
              Tôi đồng ý với{' '}
              <a
                href="/terms"
                className="font-medium text-[var(--manifest-navy)] underline underline-offset-2"
              >
                điều khoản
              </a>{' '}
              mua hộ và vận chuyển
            </span>
          </label>

          <Button
            type="button"
            variant="commerce"
            size="lg"
            disabled={!agreed || submitting}
            onClick={onSubmit}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
                Đang xử lý
              </>
            ) : (
              'Xác nhận đặt hàng'
            )}
          </Button>

          {!agreed && (
            <p className="mt-2 text-center text-xs text-[var(--graphite)]">
              Xác nhận điều khoản để tiếp tục
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  pending,
}: {
  label: string;
  value: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--graphite)]">{label}</dt>
      <dd
        data-numeric
        className={cn(
          'font-semibold',
          pending ? 'text-[var(--graphite)]/70' : 'text-[var(--ink)]',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
