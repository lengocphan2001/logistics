'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { portalConfig } from '@/config/portal.config';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { ordersService, type CustomerOrderStats } from '@/services/orders.service';
import { DashboardStatCards } from '@/components/portal/dashboard/DashboardStatCards';
import { DashboardQuickPanels } from '@/components/portal/dashboard/DashboardQuickPanels';
import { OrderTableSection } from '@/components/portal/dashboard/OrderTableSection';
import { buttonVariants } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

export function DashboardView() {
  const { profile, loading: profileLoading } = useCustomerProfile();
  const [stats, setStats] = useState<CustomerOrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    ordersService
      .getMyStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            {profileLoading ? 'Xin chào!' : `Xin chào, ${profile?.name?.split(' ').slice(-1)[0] || profile?.name}`}
          </h1>
          <p className="mt-1 text-sm text-[var(--graphite)]">
            {statsLoading ? 'Đang tải' : `Bạn có ${stats?.total ?? 0} đơn hàng trên hệ thống`}
          </p>
        </div>
        <Link href="/orders/new" className={cn(buttonVariants(), 'shrink-0')}>
          <Plus {...icon('inline')} aria-hidden />
          Tạo yêu cầu
        </Link>
      </div>

      <DashboardStatCards stats={stats} loading={statsLoading} />

      <DashboardQuickPanels />

      <div className="space-y-6">
        {portalConfig.dashboard.orderTables.map((tableConfig) => (
          <OrderTableSection key={tableConfig.type} config={tableConfig} />
        ))}
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <LoadingState />
  );
}
