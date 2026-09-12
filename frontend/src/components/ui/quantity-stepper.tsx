'use client';

import { Minus, Plus } from 'lucide-react';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  disabled?: boolean;
  /** `input` lets the customer type a quantity; `text` only shows it. */
  variant?: 'text' | 'input';
  /** Fired only by the minus and plus buttons, after `onChange`. */
  onStep?: (next: number) => void;
  /** Called when a typed value is committed (blur or Enter). */
  onCommit?: () => void;
  /** Called on every keystroke in the input variant, for debounced saving. */
  onType?: (next: number) => void;
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Minus, amount, plus — inside one bordered control so the three parts read
 * as a single field rather than as three buttons in a row.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  disabled = false,
  variant = 'text',
  onStep,
  onCommit,
  onType,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const buttonSize = size === 'sm' ? 'size-8' : 'size-9';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[var(--radius-control)] border border-[var(--rule-strong)] bg-[var(--sheet-white)]',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={disabled || value <= min}
        onClick={() => {
          const next = Math.max(min, value - 1);
          onChange(next);
          onStep?.(next);
        }}
        className={cn(
          'flex items-center justify-center text-[var(--graphite)] hover:text-[var(--ink)] disabled:opacity-40',
          buttonSize,
        )}
      >
        <Minus {...icon('inline')} aria-hidden className={size === 'sm' ? 'size-3.5' : undefined} />
      </button>

      {variant === 'input' ? (
        <input
          type="number"
          min={min}
          value={value}
          disabled={disabled}
          aria-label="Số lượng"
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (Number.isNaN(parsed)) {
              onChange(min);
              return;
            }
            onChange(parsed);
            onType?.(parsed);
          }}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          data-numeric
          className="h-8 w-12 border-x border-[var(--rule-strong)] bg-transparent text-center text-sm outline-none [appearance:textfield] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--manifest-navy)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <span
          data-numeric
          aria-live="polite"
          className="w-10 text-center text-sm font-semibold"
        >
          {value}
        </span>
      )}

      <button
        type="button"
        aria-label="Tăng số lượng"
        disabled={disabled}
        onClick={() => {
          const next = value + 1;
          onChange(next);
          onStep?.(next);
        }}
        className={cn(
          'flex items-center justify-center text-[var(--graphite)] hover:text-[var(--ink)] disabled:opacity-40',
          buttonSize,
        )}
      >
        <Plus {...icon('inline')} aria-hidden className={size === 'sm' ? 'size-3.5' : undefined} />
      </button>
    </div>
  );
}
