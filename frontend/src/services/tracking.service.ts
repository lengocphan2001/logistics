import api from '@/lib/api';
import type { OrderStatus } from '@/lib/order-status';
import type { OrderType } from '@/lib/order-type';

export interface TrackingEvent {
  status: OrderStatus;
  location?: string | null;
  createdAt: string;
}

/**
 * The public view of a parcel. Deliberately narrow: anyone holding the code
 * can read it, so it carries the journey and nothing identifying.
 */
export interface TrackingResult {
  billOfLadingCode: string;
  type: OrderType;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  receiverProvince?: string | null;
  warehouse?: { name: string; country: 'CN' | 'VN' } | null;
  events: TrackingEvent[];
}

export const trackingService = {
  lookup: (code: string) =>
    api.get<TrackingResult>(`/tracking/${encodeURIComponent(code)}`),
};
