import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { icon } from '@/lib/icon';
import type { CustomerOrder } from '@/services/orders.service';
import { orderTypeLabels } from '@/lib/order-type';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CustomerOrderCardProps = {
  order: CustomerOrder;
  className?: string;
};

export function CustomerOrderCard({ order, className }: CustomerOrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className={cn(
        'block border border-[var(--rule)] bg-[var(--sheet-white)] p-4 hover:border-[var(--manifest-navy)]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-sm font-semibold leading-snug">{order.billOfLadingCode}</p>
          <p className="mt-1 text-xs text-[var(--graphite)]">
            {orderTypeLabels[order.type]}
          </p>
          <p className="text-xs text-[var(--graphite)]">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge variant="outline" className={cn('ml-auto shrink-0 font-normal', orderStatusBadgeColors[order.status])}>
          {orderStatusLabels[order.status]}
        </Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="text-sm">
          <p className="text-[var(--graphite)]">
            Tổng phí{' '}
            <span data-numeric className="font-semibold text-[var(--ink)]">
              {formatCny(order.totalFee)}
            </span>
          </p>
          <p className="text-xs text-[var(--graphite)]">
            Đã cọc <span data-numeric>{formatCny(order.depositAmount)}</span>
          </p>
        </div>
        <span className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'shrink-0 px-2')}>
          Chi tiết
          <ChevronRight {...icon('inline')} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
