'use client';

import { formatDateTime } from '@/lib/date';
import type { OrderStatus } from '@/lib/order-status';
import type { CustomerOrderEvent, OrderStep } from '@/services/orders.service';

type OrderProgressProps = {
  flow: OrderStep[];
  currentStatus: OrderStatus;
  events: CustomerOrderEvent[];
};

/**
 * The steps this order actually takes, not every status the system has. A
 * consignment shows no purchase step, because it will never have one.
 */
export function OrderProgress({ flow, currentStatus, events }: OrderProgressProps) {
  const cancelled = currentStatus === 'CANCELLED';
  const currentIndex = flow.findIndex((step) => step.status === currentStatus);

  const firstEventAt = new Map<string, string>();
  for (const event of [...events].reverse()) {
    if (!firstEventAt.has(event.status)) {
      firstEventAt.set(event.status, event.createdAt);
    }
  }

  if (cancelled) {
    return (
      <section className="border border-[var(--rule)] bg-[var(--sheet-white)] p-4 sm:p-6">
        <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
          Tiến trình
        </h2>
        <p data-prose className="mt-2 text-sm">
          Đơn hàng đã huỷ.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-[var(--rule)] bg-[var(--sheet-white)] p-4 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
        Tiến trình
      </h2>

      <ol className="mt-4">
        {flow.map((step, index) => {
          const done = currentIndex >= 0 && index <= currentIndex;
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
              <div className="min-w-0 flex-1">
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
    </section>
  );
}
