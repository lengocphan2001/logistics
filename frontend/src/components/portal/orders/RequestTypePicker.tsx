'use client';

import {
  CUSTOMER_REQUEST_TYPES,
  orderTypeDescriptions,
  orderTypeLabels,
  type CustomerRequestType,
} from '@/lib/order-type';
import { cn } from '@/lib/utils';

type RequestTypePickerProps = {
  value: CustomerRequestType;
  onChange: (next: CustomerRequestType) => void;
};

/**
 * The three request types differ in what the customer already has, so each one
 * states that rather than only naming itself.
 */
export function RequestTypePicker({ value, onChange }: RequestTypePickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[var(--ink)]">Loại yêu cầu</legend>
      <div className="mt-3 grid gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-3">
        {CUSTOMER_REQUEST_TYPES.map((type) => {
          const active = value === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(type)}
              className={cn(
                'p-4 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
                active
                  ? 'bg-[var(--navy-wash)]'
                  : 'bg-[var(--sheet-white)] hover:bg-[var(--wash)]',
              )}
            >
              <span
                className={cn(
                  'block font-heading text-sm font-semibold',
                  active ? 'text-[var(--manifest-navy)]' : 'text-[var(--ink)]',
                )}
              >
                {orderTypeLabels[type]}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--graphite)]">
                {orderTypeDescriptions[type]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
