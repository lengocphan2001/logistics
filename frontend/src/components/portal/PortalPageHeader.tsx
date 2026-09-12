import { cn } from '@/lib/utils';

type PortalPageHeaderProps = {
  /** Kept for callers that still pass one; rendered as plain secondary text. */
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * A page opens with its title and a rule. No spaced-capital kicker, and no
 * decorative icon beside the heading — the heading is already the label.
 */
export function PortalPageHeader({
  eyebrow,
  title,
  description,
  className,
}: PortalPageHeaderProps) {
  return (
    <div className={cn('border-b border-[var(--rule)] pb-4', className)}>
      {eyebrow && <p className="text-sm text-[var(--graphite)]">{eyebrow}</p>}
      <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">{title}</h1>
      {description && (
        <p data-prose className="mt-1 text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
