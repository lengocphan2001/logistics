'use client';

import Link from 'next/link';
import { portalConfig } from '@/config/portal.config';
import { portalStatIcons } from '@/components/portal/icon-map';
import { icon } from '@/lib/icon';
import type { CustomerOrderStats } from '@/services/orders.service';

type StatCardsProps = {
  stats: CustomerOrderStats | null;
  loading?: boolean;
};

/**
 * Four counts in one strip. The number carries the weight; the icon is there
 * to tell the four order types apart at a glance, and takes the same colour
 * as the surrounding text.
 */
export function DashboardStatCards({ stats, loading }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)] lg:grid-cols-4">
      {portalConfig.dashboard.statCards.map((card) => {
        const Icon = portalStatIcons[card.icon];
        const count = stats?.byType?.[card.type] ?? 0;

        return (
          <Link
            key={card.type}
            href={`/orders?type=${card.type}`}
            className="group bg-[var(--sheet-white)] p-4 outline-none hover:bg-[var(--navy-wash)]/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--manifest-navy)] sm:p-5"
          >
            <div className="flex items-center gap-2 text-[var(--graphite)]">
              <Icon {...icon('inline')} aria-hidden />
              <span className="text-sm font-medium text-[var(--ink)]">{card.label}</span>
            </div>
            <p
              data-numeric
              className="mt-3 text-3xl font-bold text-[var(--ink)] sm:text-4xl"
            >
              {loading ? '—' : count}
            </p>
            <p className="mt-1 text-xs text-[var(--graphite)]">{card.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
