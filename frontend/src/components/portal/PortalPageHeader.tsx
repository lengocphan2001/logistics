import { cn } from '@/lib/utils';

type PortalPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  icon,
  className,
}: PortalPageHeaderProps) {
  return (
    <div className={cn(className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          'font-bold text-[var(--portal-foreground)]',
          eyebrow ? 'mt-1' : '',
          'flex items-center gap-2 text-xl sm:text-2xl',
        )}
      >
        {icon}
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-[var(--portal-muted)]">{description}</p>
      )}
    </div>
  );
}
