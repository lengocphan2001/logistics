'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Tổng quan',
  orders: 'Đơn hàng',
  shipments: 'Vận chuyển',
  customers: 'Khách hàng',
  'wallet-transactions': 'Lịch sử giao dịch',
  warehouses: 'Kho hàng',
  staff: 'Nhân viên',
  drivers: 'Tài xế',
  vehicles: 'Phương tiện',
  reports: 'Báo cáo',
  settings: 'Cài đặt',
};

/** Shown only on detail pages, where the operator needs a way back up. */
export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Đường dẫn" className="text-sm text-[var(--graphite)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {segments.map((seg, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/');
          const label = routeLabels[seg] ?? seg;
          const isLast = i === segments.length - 1;

          return (
            <li key={href} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden className="text-[var(--rule-strong)]">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-[var(--ink)]">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className={cn('hover:text-[var(--manifest-navy)] hover:underline')}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
