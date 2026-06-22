'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { portalConfig } from '@/config/portal.config';
import { portalStatIcons } from '@/components/portal/icon-map';
import type { CustomerOrderStats } from '@/services/orders.service';

type StatCardsProps = {
  stats: CustomerOrderStats | null;
  loading?: boolean;
};

export function DashboardStatCards({ stats, loading }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {portalConfig.dashboard.statCards.map((card) => {
        const Icon = portalStatIcons[card.icon];
        const count = stats?.byType?.[card.type] ?? 0;

        return (
          <Link
            key={card.type}
            href={`/orders?type=${card.type}`}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md sm:p-5',
              card.accent,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--portal-muted)]">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[var(--portal-foreground)] sm:text-3xl">
                  {loading ? '—' : count}
                </p>
                <p className="mt-0.5 text-xs text-[var(--portal-muted)]">{card.description}</p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                  card.iconClass,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
