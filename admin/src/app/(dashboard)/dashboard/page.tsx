'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { PageHeader } from '@/components/layout/PageHeader';
import api from '@/lib/api';
import { ordersService, type Order } from '@/services/orders.service';
import { customersService } from '@/services/customers.service';
import {
  type OrderStatus,
  orderStatusLabels,
  orderStatusBadgeColors,
  orderStatusBarColors,
  inProgressStatuses,
} from '@/lib/order-status';
import { formatVnd } from '@/lib/currency';
import { apiErrorMessage } from '@/lib/api-error';

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  revenue: { totalFee: number | string | null; codAmount: number | string | null };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customerTotal, setCustomerTotal] = useState(0);
  const [warehouseTotal, setWarehouseTotal] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, customersRes, warehousesRes] = await Promise.all([
          ordersService.getStats(),
          ordersService.getAll({ limit: 5, sortOrder: 'desc' }),
          customersService.getAll({ limit: 1 }),
          api.get('/warehouses'),
        ]);

        setOrderStats(statsRes.data);
        setRecentOrders(ordersRes.data.data ?? ordersRes.data);
        setCustomerTotal(
          customersRes.data.total ?? (customersRes.data.data ?? customersRes.data).length,
        );
        setWarehouseTotal(Array.isArray(warehousesRes.data) ? warehousesRes.data.length : 0);
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Không thể tải dữ liệu tổng quan'));
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const inProgressCount = inProgressStatuses.reduce(
    (sum, status) => sum + (orderStats?.byStatus[status] ?? 0),
    0,
  );

  /* Four counts on one strip, divided by rules. The number carries the
     weight; no coloured tile behind an icon. */
  const stats = [
    {
      id: 'stat-orders',
      title: 'Tổng đơn hàng',
      value: formatNumber(orderStats?.total ?? 0),
      description: 'đơn trong hệ thống',
    },
    {
      id: 'stat-in-transit',
      title: 'Đang xử lý',
      value: formatNumber(inProgressCount),
      description: 'từ mua hàng đến yêu cầu giao',
    },
    {
      id: 'stat-customers',
      title: 'Khách hàng',
      value: formatNumber(customerTotal),
      description: 'tài khoản khách hàng',
    },
    {
      id: 'stat-revenue',
      title: 'Tổng phí vận chuyển',
      value: formatVnd(orderStats?.revenue.totalFee ?? 0),
      description: `Thu hộ ${formatVnd(orderStats?.revenue.codAmount ?? 0)}`,
    },
  ];

  const statusBreakdown = orderStats
    ? (Object.entries(orderStats.byStatus) as [OrderStatus, number][])
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
    : [];

  const orderTotal = orderStats?.total || 1;

  if (loading) {
    return <LoadingState label="Đang tải dữ liệu tổng quan" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tổng quan"
        description="Tình trạng đơn hàng, khách hàng và doanh thu phí của toàn hệ thống."
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)] lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} id={stat.id} className="bg-[var(--sheet-white)] p-4 sm:p-5">
            <p className="text-sm font-medium text-[var(--ink)]">{stat.title}</p>
            <p data-numeric className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-[var(--graphite)]">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section id="dashboard-recent-orders" className="panel overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--rule)] px-4 py-3">
            <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
              Đơn hàng gần đây
            </h2>
            <Link
              href="/orders"
              className="text-sm font-medium text-[var(--manifest-navy)] hover:underline hover:underline-offset-4"
            >
              Xem tất cả
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState icon={Package} title="Chưa có đơn hàng nào" className="border-0 py-12" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Mã vận đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Tổng phí</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-[var(--manifest-navy)] hover:underline"
                        >
                          {order.billOfLadingCode}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-[var(--ink)]">
                        {order.customer?.fullName ?? order.senderName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell data-numeric className="text-right text-sm font-semibold">
                        {formatVnd(order.totalFee)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section id="dashboard-order-status" className="panel p-4">
            <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
              Phân bổ trạng thái
            </h2>
            <div className="mt-3 space-y-3">
              {statusBreakdown.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--graphite)]">
                  Chưa có dữ liệu
                </p>
              ) : (
                statusBreakdown.map(([status, count]) => (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--graphite)]">{orderStatusLabels[status]}</span>
                      <span data-numeric className="font-semibold text-[var(--ink)]">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-[var(--wash)]">
                      <div
                        className={`h-full ${orderStatusBarColors[status] ?? 'bg-[var(--manifest-navy)]'}`}
                        style={{ width: `${Math.round((count / orderTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="dashboard-summary" className="panel p-4">
            <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
              Tổng quan hệ thống
            </h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[var(--graphite)]">Kho đang hoạt động</dt>
                <dd data-numeric className="font-semibold text-[var(--ink)]">
                  {warehouseTotal}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[var(--graphite)]">Tài khoản khách hàng</dt>
                <dd data-numeric className="font-semibold text-[var(--ink)]">
                  {formatNumber(customerTotal)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[var(--graphite)]">Đơn đã hoàn thành</dt>
                <dd data-numeric className="font-semibold text-[var(--ledger-green)]">
                  {orderStats?.byStatus.COMPLETED ?? 0}
                </dd>
              </div>
            </dl>
          </section>

          {recentOrders.length > 0 && (
            <section id="dashboard-activity" className="panel p-4">
              <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
                Hoạt động gần đây
              </h2>
              <ul className="mt-3 space-y-3">
                {recentOrders.slice(0, 4).map((order) => (
                  <li key={order.id} className="border-l-2 border-[var(--rule)] pl-3">
                    <p className="text-xs leading-relaxed text-[var(--ink)]">
                      Đơn{' '}
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono font-semibold text-[var(--manifest-navy)] hover:underline"
                      >
                        {order.billOfLadingCode}
                      </Link>{' '}
                      {orderStatusLabels[order.status].toLowerCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--graphite)]">
                      {timeAgo(order.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
