import { Loader2 } from 'lucide-react';
import { icon, type IconSize } from '@/lib/icon';
import { cn } from '@/lib/utils';

type LoadingStateProps = {
  /** Announced to screen readers and shown under the spinner when `label` is set. */
  label?: string;
  size?: IconSize;
  className?: string;
};

/** A centred spinner with a live region. Use wherever a region is waiting on data. */
export function LoadingState({
  label = 'Đang tải',
  size = 'page',
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn('flex flex-col items-center justify-center gap-3 py-24', className)}
    >
      <Loader2
        {...icon(size)}
        aria-hidden
        className="animate-spin text-[var(--manifest-navy)]"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
