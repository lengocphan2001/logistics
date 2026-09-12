import type { LucideIcon } from 'lucide-react';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  /** Action shown under the text, usually a single Button. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The "nothing here" panel: a dashed outline rather than a filled card, so an
 * empty region reads as absence instead of as content.
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-dashed border-[var(--rule-strong)] px-6 py-20 text-center',
        className,
      )}
    >
      {Icon && (
        <Icon {...icon('page')} aria-hidden className="mb-3 text-[var(--rule-strong)]" />
      )}
      <p className="font-heading text-base font-semibold text-[var(--ink)]">{title}</p>
      {hint && (
        <p data-prose className="mt-1 text-sm">
          {hint}
        </p>
      )}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
