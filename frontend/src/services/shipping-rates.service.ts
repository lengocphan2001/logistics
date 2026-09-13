import api from '@/lib/api';

export interface ShippingRate {
  id: string;
  method: string;
  name: string;
  pricePerKgVnd: number | string;
  minChargeVnd: number | string;
  estimatedDays?: string | null;
  note?: string | null;
  sortOrder: number;
}

export const shippingRatesService = {
  /** Active lines only. Public, so the quote works before sign-in too. */
  list: () => api.get<ShippingRate[]>('/shipping-rates'),
};

/**
 * Chargeable weight is billed per kilogram with a floor, which is how the
 * lines are actually priced. Returns null when the weight is unknown, since
 * an invented number would read as a promise.
 */
export function estimateShippingVnd(
  rate: Pick<ShippingRate, 'pricePerKgVnd' | 'minChargeVnd'> | undefined,
  weightKg: number | null,
): number | null {
  if (!rate || weightKg == null || weightKg <= 0) return null;
  const perKg = Number(rate.pricePerKgVnd) * weightKg;
  return Math.max(perKg, Number(rate.minChargeVnd));
}
