'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Clock,
  Warehouse,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
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

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));

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
        setCustomerTotal(customersRes.data.total ?? (customersRes.data.data ?? customersRes.data).length);
        setWarehouseTotal(Array.isArray(warehousesRes.data) ? warehousesRes.data.length : 0);
      } catch (err: any) {
        toast.error('Không thể tải dữ liệu dashboard: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const inProgressCount = inProgressStatuses.reduce(
    (sum, status) => sum + (orderStats?.byStatus[status] ?? 0),
    0,
  );

  const stats = [
    {
      id: 'stat-orders',
      title: 'Tổng đơn hàng',
      value: formatNumber(orderStats?.total ?? 0),
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'đơn trong hệ thống',
    },
    {
      id: 'stat-in-transit',
      title: 'Đang xử lý',
      value: formatNumber(inProgressCount),
      icon: Package,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      description: 'từ mua hàng đến yêu cầu giao',
    },
    {
      id: 'stat-customers',
      title: 'Khách hàng',
      value: formatNumber(customerTotal),
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      description: 'tài khoản khách hàng',
    },
    {
      id: 'stat-revenue',
      title: 'Tổng phí vận chuyển',
      value: formatCurrency(orderStats?.revenue.totalFee),
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      description: `COD: ${formatCurrency(orderStats?.revenue.codAmount)}`,
    },
  ];

  const statusBreakdown = orderStats
    ? (Object.entries(orderStats.byStatus) as [OrderStatus, number][])
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
    : [];

  const orderTotal = orderStats?.total || 1;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} id={stat.id} className="border-border/60 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card id="dashboard-recent-orders" className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Đơn hàng gần đây</CardTitle>
              <Link href="/orders" className="text-xs text-primary hover:underline font-medium">
                Xem tất cả →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Package className="w-10 h-10 opacity-40" />
                <p className="text-sm">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/65 uppercase tracking-wider">Mã vận đơn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/65 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground/65 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-foreground/65 uppercase tracking-wider">Tổng phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <Link href={`/orders/${order.id}`} className="font-mono font-medium text-primary hover:underline">
                            {order.billOfLadingCode}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-foreground">
                          {order.customer?.fullName ?? order.senderName}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge className={orderStatusBadgeColors[order.status]}>
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-foreground">
                          {formatCurrency(order.totalFee)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card id="dashboard-order-status" className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Phân bổ trạng thái đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
              ) : (
                statusBreakdown.map(([status, count]) => (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{orderStatusLabels[status]}</span>
                      <span className="text-foreground font-semibold">{count} đơn</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${orderStatusBarColors[status] ?? 'bg-primary'}`}
                        style={{ width: `${Math.round((count / orderTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card id="dashboard-summary" className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tổng quan hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Warehouse className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kho hàng</p>
                  <p className="text-sm font-semibold">{warehouseTotal} kho đang hoạt động</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Khách hàng</p>
                  <p className="text-sm font-semibold">{formatNumber(customerTotal)} tài khoản</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Package className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hoàn thành</p>
                  <p className="text-sm font-semibold">{orderStats?.byStatus.COMPLETED ?? 0} đơn</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {recentOrders.length > 0 && (
            <Card id="dashboard-activity" className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-start gap-3">
                    <div className="mt-0.5 text-primary">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">
                        Đơn{' '}
                        <Link href={`/orders/${order.id}`} className="font-mono text-primary hover:underline">
                          {order.billOfLadingCode}
                        </Link>
                        {' — '}
                        {orderStatusLabels[order.status]}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
