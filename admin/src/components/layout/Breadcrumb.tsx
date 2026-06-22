'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const routeLabels: Record<string, string> = {
  dashboard: 'Tổng quan',
  orders: 'Đơn hàng',
  shipments: 'Vận chuyển',
  customers: 'Khách hàng',
  'wallet-transactions': 'Lịch sử giao dịch',
  drivers: 'Tài xế',
  vehicles: 'Phương tiện',
  reports: 'Báo cáo',
  settings: 'Cài đặt',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = routeLabels[seg] ?? seg;
        const isLast = i === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
