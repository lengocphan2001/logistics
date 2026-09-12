'use client';

import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { CustomerOrderCard } from '@/components/portal/CustomerOrderCard';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CustomerOrder } from '@/services/orders.service';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { orderTypeLabels } from '@/lib/order-type';
import { formatCny } from '@/lib/currency';
import { formatDate, formatDateTime } from '@/lib/date';

type OrderTableProps = {
  orders: CustomerOrder[];
  loading?: boolean;
  /** Dashboard sections are already grouped by type, so they hide the column. */
  showType?: boolean;
  /** Lists show the time of day; compact dashboard tables show the day only. */
  dateStyle?: 'date' | 'dateTime';
  emptyTitle?: string;
};

/**
 * One order list for the whole portal: cards on a phone, a table from the
 * medium breakpoint up. The two call sites differ only in whether the type
 * column is shown and how precise the date is.
 */
export function OrderTable({
  orders,
  loading = false,
  showType = false,
  dateStyle = 'dateTime',
  emptyTitle = 'Chưa có đơn hàng',
}: OrderTableProps) {
  if (loading) {
    return <LoadingState className="py-14" />;
  }

  if (orders.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} className="border-0 py-14" />;
  }

  const formatCreatedAt = dateStyle === 'date' ? formatDate : formatDateTime;

  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {orders.map((order) => (
          <CustomerOrderCard key={order.id} order={order} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap">Mã vận đơn</TableHead>
              {showType && <TableHead className="whitespace-nowrap">Loại</TableHead>}
              <TableHead className="whitespace-nowrap">Ngày tạo</TableHead>
              <TableHead className="whitespace-nowrap text-right">Tổng phí</TableHead>
              <TableHead className="whitespace-nowrap text-right">Đã cọc</TableHead>
              <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-semibold">
                  {order.billOfLadingCode}
                </TableCell>
                {showType && (
                  <TableCell className="text-sm">{orderTypeLabels[order.type]}</TableCell>
                )}
                <TableCell className="text-sm text-[var(--graphite)]">
                  {formatCreatedAt(order.createdAt)}
                </TableCell>
                <TableCell data-numeric className="text-right text-sm font-semibold">
                  {formatCny(order.totalFee)}
                </TableCell>
                <TableCell data-numeric className="text-right text-sm text-[var(--graphite)]">
                  {formatCny(order.depositAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/orders/${order.id}`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    Chi tiết
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
