'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowRight, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerOrderCard } from '@/components/portal/CustomerOrderCard';
import { ordersService, type CustomerOrder } from '@/services/orders.service';
import type { PortalOrderTableConfig } from '@/config/portal.config';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { formatCny } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type OrderTableSectionProps = {
  config: PortalOrderTableConfig;
};

export function OrderTableSection({ config }: OrderTableSectionProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService
      .getMine({ type: config.type, limit: config.limit, page: 1 })
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [config.type, config.limit]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--portal-border)] bg-white shadow-sm">
      <div className={cn('flex items-center justify-between px-4 py-3 sm:px-5', config.headerClass)}>
        <h3 className="font-semibold">{config.title}</h3>
        <Link
          href={config.viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white"
        >
          Xem tất cả
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-accent)]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-[var(--portal-muted)]">
          <Inbox className="h-10 w-10 opacity-40" />
          <p className="text-sm">Chưa có đơn hàng</p>
        </div>
      ) : (
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
                <TableHead className="whitespace-nowrap">Ngày đặt</TableHead>
                <TableHead className="whitespace-nowrap text-right">Tổng phí</TableHead>
                <TableHead className="whitespace-nowrap text-right">Đã cọc</TableHead>
                <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-medium">{order.billOfLadingCode}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-[var(--portal-muted)]">
                    {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCny(order.totalFee)}
                  </TableCell>
                  <TableCell className="text-right text-sm">{formatCny(order.depositAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('font-normal', orderStatusBadgeColors[order.status])}
                    >
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs font-medium text-[var(--brand-accent)] hover:underline"
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
      )}
    </section>
  );
}
