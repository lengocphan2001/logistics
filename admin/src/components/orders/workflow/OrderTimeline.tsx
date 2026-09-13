'use client';

import { formatDateTime } from '@/lib/date';
import type { OrderEvent, OrderStep } from '@/services/orders.service';
import type { OrderStatus } from '@/lib/order-status';

type OrderTimelineProps = {
  flow: OrderStep[];
  currentStatus: OrderStatus;
  events: OrderEvent[];
};

/**
 * Two things a timeline has to answer: where the order is on its own path, and
 * what was actually written down along the way. The path is drawn from this
 * order type's flow, so a consignment never shows a purchase step it will
 * never take.
 */
export function OrderTimeline({ flow, currentStatus, events }: OrderTimelineProps) {
  const currentIndex = flow.findIndex((step) => step.status === currentStatus);
  const closed = currentStatus === 'CANCELLED';

  const firstEventAt = new Map<string, string>();
  for (const event of [...events].reverse()) {
    if (!firstEventAt.has(event.status)) {
      firstEventAt.set(event.status, event.createdAt);
    }
  }

  return (
    <section className="panel">
      <h2 className="border-b border-[var(--rule)] px-5 py-3.5 font-heading text-base font-semibold text-[var(--ink)]">
        Tiến trình
      </h2>

      <ol className="px-5 py-4">
        {flow.map((step, index) => {
          const done = !closed && currentIndex >= 0 && index <= currentIndex;
          const current = step.status === currentStatus;
          const at = firstEventAt.get(step.status);

          return (
            <li key={step.status} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={
                    done
                      ? 'mt-1 size-2.5 shrink-0 rounded-full bg-[var(--manifest-navy)]'
                      : 'mt-1 size-2.5 shrink-0 rounded-full border border-[var(--rule-strong)] bg-[var(--sheet-white)]'
                  }
                />
                {index < flow.length - 1 && (
                  <span
                    aria-hidden
                    className={
                      done
                        ? 'mt-1 w-px flex-1 bg-[var(--manifest-navy)]'
                        : 'mt-1 w-px flex-1 bg-[var(--rule)]'
                    }
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <p
                  className={
                    current
                      ? 'text-sm font-semibold text-[var(--ink)]'
                      : 'text-sm text-[var(--graphite)]'
                  }
                >
                  {step.label}
                </p>
                {at && (
                  <p data-numeric className="text-xs text-[var(--graphite)]">
                    {formatDateTime(at)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {events.length > 0 && (
        <div className="border-t border-[var(--rule)]">
          <h3 className="px-5 pt-4 text-sm font-semibold text-[var(--ink)]">
            Nhật ký
          </h3>
          <ul className="divide-y divide-[var(--rule)]">
            {events.map((event) => (
              <li key={event.id} className="px-5 py-3">
                <p className="text-sm text-[var(--ink)]">
                  {event.note ?? event.status}
                </p>
                <p data-numeric className="text-xs text-[var(--graphite)]">
                  {formatDateTime(event.createdAt)}
                  {event.location ? ` — ${event.location}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
