import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Primary action for the page, usually one button. */
  action?: React.ReactNode;
  className?: string;
};

/**
 * A page opens with its name, one line of explanation and at most one action,
 * closed by a rule. No icon beside the heading: the sidebar already says
 * where the operator is.
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-[var(--rule)] pb-4 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">{title}</h1>
        {description && (
          <p data-prose className="mt-1 text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
