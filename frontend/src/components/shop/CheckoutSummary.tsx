'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OPTIONAL_SERVICES } from '@/components/shop/checkout.constants';
import { formatVnd } from '@/lib/currency';
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
  const pendingLabel = 'Đang cập nhật';

  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tổng đơn</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">{formatVnd(grandTotalVnd)}</p>
        </div>

        <div className="space-y-2.5 px-5 py-4 text-sm">
          <SummaryRow label="Tổng tiền hàng" value={formatVnd(goodsTotalVnd)} />
          <SummaryRow label="Phí mua hàng" value={formatVnd(serviceFeeVnd)} muted />
          <SummaryRow label="Phí ship nội địa TQ" value={pendingLabel} pending />
          <SummaryRow label="Phí ship quốc tế TQ–VN" value={pendingLabel} pending />
          <SummaryRow label="Phí ship nội địa VN" value={pendingLabel} pending />
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Dịch vụ tuỳ chọn
          </p>
          <div className="space-y-2.5">
            {OPTIONAL_SERVICES.map((svc) => {
              const checked = !!services[svc.id];
              return (
                <div key={svc.id} className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => onServiceToggle(svc.id, v === true)}
                    />
                    <span className="text-sm text-gray-700">{svc.label}</span>
                  </label>
                  <span className="shrink-0 text-xs text-gray-400">
                    {checked ? 'Đã chọn' : 'Không yêu cầu'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
            Các khoản &quot;Đang cập nhật&quot; sẽ được tính sau khi hàng về kho VN theo cân nặng thực
            tế và bảng giá dịch vụ.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Tổng tiền
          </span>
          <span className="text-xl font-bold text-gray-900">{formatVnd(grandTotalVnd)}</span>
        </div>

        <label className="mb-4 flex cursor-pointer items-start gap-2.5">
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => onAgreedChange(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-snug text-gray-600">
            Tôi đồng ý với{' '}
            <a href="/terms" className="text-sky-600 hover:underline">
              các điều khoản
            </a>{' '}
            mua hộ và vận chuyển
          </span>
        </label>

        {!agreed && (
          <p className="mb-3 text-xs text-red-500">Vui lòng xác nhận trước khi hoàn tất</p>
        )}

        <Button
          type="button"
          size="lg"
          disabled={!agreed || submitting}
          onClick={onSubmit}
          className="w-full bg-sky-600 text-base font-semibold hover:bg-sky-700"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Hoàn thành'
          )}
        </Button>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  muted,
  pending,
}: {
  label: string;
  value: string;
  muted?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span
        className={cn(
          'font-medium',
          pending && 'text-gray-400 italic',
          muted && !pending && 'text-gray-700',
          !muted && !pending && 'text-gray-900',
        )}
      >
        {value}
      </span>
    </div>
  );
}
