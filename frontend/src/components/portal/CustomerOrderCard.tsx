import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import type { CustomerOrder } from '@/services/orders.service';
import { orderTypeLabels } from '@/lib/order-type';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
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
        'block rounded-xl border border-[var(--portal-border)] bg-white p-4 shadow-sm transition-colors hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-surface-muted)]/30',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-sm font-semibold leading-snug">{order.billOfLadingCode}</p>
          <p className="mt-0.5 text-xs text-[var(--portal-muted)]">
            {orderTypeLabels[order.type]} ·{' '}
            {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </p>
        </div>
        <Badge variant="outline" className={cn('ml-auto shrink-0 font-normal', orderStatusBadgeColors[order.status])}>
          {orderStatusLabels[order.status]}
        </Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="text-sm">
          <p className="text-[var(--portal-muted)]">
            Tổng phí{' '}
            <span className="font-semibold text-[var(--portal-foreground)]">
              {formatCny(order.totalFee)}
            </span>
          </p>
          <p className="text-xs text-[var(--portal-muted)]">
            Đã cọc {formatCny(order.depositAmount)}
          </p>
        </div>
        <span className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'shrink-0 px-2')}>
          Chi tiết
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
