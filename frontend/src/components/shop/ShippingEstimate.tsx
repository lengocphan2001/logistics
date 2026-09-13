'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  estimateShippingVnd,
  shippingRatesService,
} from '@/services/shipping-rates.service';
import { formatVnd } from '@/lib/currency';

type ShippingEstimateProps = {
  /** The line the customer picked, matching ShippingRate.method. */
  method: string;
};

/**
 * Real weight is only known once the parcel reaches the Vietnamese warehouse,
 * so this quotes the unit price of the chosen line and lets the customer try a
 * weight. It is labelled an estimate everywhere, never added to the total.
 */
export function ShippingEstimate({ method }: ShippingEstimateProps) {
  const [weight, setWeight] = useState('');

  const { data: rates = [] } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: async () => (await shippingRatesService.list()).data,
    staleTime: 60 * 60 * 1000,
  });

  const rate = rates.find((r) => r.method === method);
  if (!rate) return null;

  const weightKg = weight ? Number(weight) : null;
  const estimate = estimateShippingVnd(rate, weightKg);

  return (
    <div className="border-t border-[var(--rule)] px-5 py-4">
      <h3 className="text-sm font-semibold text-[var(--ink)]">Phí vận chuyển quốc tế</h3>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--graphite)]">{rate.name}</dt>
          <dd data-numeric className="font-semibold text-[var(--ink)]">
            {formatVnd(rate.pricePerKgVnd)} mỗi kg
          </dd>
        </div>
        {rate.estimatedDays && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--graphite)]">Thời gian dự kiến</dt>
            <dd>{rate.estimatedDays}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--graphite)]">Phí tối thiểu</dt>
          <dd data-numeric>{formatVnd(rate.minChargeVnd)}</dd>
        </div>
      </dl>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="weight-estimate">Ước tính cân nặng (kg)</Label>
        <Input
          id="weight-estimate"
          type="number"
          min={0}
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ví dụ 3.5"
        />
      </div>

      {estimate != null && (
        <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-[var(--rule)] pt-3 text-sm">
          <span className="text-[var(--graphite)]">Ước tính</span>
          <span data-numeric className="font-bold text-[var(--ink)]">
            {formatVnd(estimate)}
          </span>
        </p>
      )}

      <p data-prose className="mt-2 text-xs">
        Con số này chỉ để tham khảo. Phí thật tính theo cân nặng đo tại kho Việt
        Nam, có thể khác khi hàng cồng kềnh.
      </p>
    </div>
  );
}
