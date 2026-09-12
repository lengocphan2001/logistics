import { Check } from 'lucide-react';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

const STEPS = ['Giỏ hàng', 'Thanh toán', 'Hoàn tất'] as const;

export type PurchaseStep = (typeof STEPS)[number];

/**
 * Buying really is sequential, so the three stages are shown — but as a
 * continuous rule with one filled marker, not as numbered chapters. Done
 * stages carry a check; the current one carries the weight.
 */
export function PurchaseProgress({
  current,
  className,
}: {
  current: PurchaseStep;
  className?: string;
}) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <nav aria-label="Tiến trình đặt hàng" className={cn('w-full', className)}>
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap text-sm',
                  active && 'font-semibold text-[var(--ink)]',
                  done && 'text-[var(--ledger-green)]',
                  !active && !done && 'text-[var(--graphite)]',
                )}
              >
                {done && <Check {...icon('inline')} aria-hidden className="size-4" />}
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px flex-1',
                    i < currentIndex ? 'bg-[var(--ledger-green)]' : 'bg-[var(--rule)]',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
