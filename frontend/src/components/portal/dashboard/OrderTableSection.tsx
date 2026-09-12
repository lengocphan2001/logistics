'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OrderTable } from '@/components/portal/OrderTable';
import { ordersService, type CustomerOrder } from '@/services/orders.service';
import type { PortalOrderTableConfig } from '@/config/portal.config';

type OrderTableSectionProps = {
  config: PortalOrderTableConfig;
};

/** One order type, most recent first, with a link to the full list. */
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
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--rule)] px-4 py-3 sm:px-5">
        <h3 className="font-heading text-base font-semibold text-[var(--ink)]">
          {config.title}
        </h3>
        <Link
          href={config.viewAllHref}
          className="text-sm font-medium text-[var(--manifest-navy)] hover:underline hover:underline-offset-4"
        >
          Xem tất cả
        </Link>
      </div>

      <OrderTable orders={orders} loading={loading} dateStyle="date" />
    </section>
  );
}
