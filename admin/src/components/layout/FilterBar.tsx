import { cn } from '@/lib/utils';

/**
 * Search and filters sit on one rule above the table, on the page ground
 * rather than in a card, so the table below is the only framed surface.
 */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      {children}
    </div>
  );
}
