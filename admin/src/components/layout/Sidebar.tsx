'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { icon } from '@/lib/icon';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE_MANAGER', 'DRIVER'] },
  { title: 'Đơn hàng', href: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'SALES', 'WAREHOUSE_MANAGER'] },
  { title: 'Khách hàng', href: '/customers', icon: Users, roles: ['ADMIN', 'SALES'] },
  { title: 'Lịch sử giao dịch', href: '/wallet-transactions', icon: Wallet, roles: ['ADMIN', 'SALES'] },
  { title: 'Kho hàng', href: '/warehouses', icon: Warehouse, roles: ['ADMIN'] },
  { title: 'Nhân viên', href: '/staff', icon: UserCog, roles: ['ADMIN'] },
];

const bottomItems = [{ title: 'Cài đặt', href: '/settings', icon: Settings }];

interface NavLinkProps {
  href: string;
  title: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
}

/** Active state is a left marker plus full-strength text, not a pill. */
function NavLink({ href, title, icon: Icon, isActive, collapsed }: NavLinkProps) {
  const link = (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? title : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 py-2.5 pl-4 pr-3 text-sm',
        isActive
          ? 'bg-[var(--sidebar-accent)] font-semibold text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
    >
      {isActive && (
        <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-white" />
      )}
      <Icon {...icon('control')} aria-hidden className="shrink-0" />
      {!collapsed && <span className="truncate">{title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{title}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role?.toUpperCase() || '';

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <TooltipProvider delay={0}>
      <aside
        data-chrome
        className={cn(
          'sidebar-transition z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]',
          sidebarCollapsed ? 'w-[68px]' : 'w-60',
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--sidebar-border)] px-3">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold tracking-[-0.02em] text-white">
                Logistics
              </p>
              <p className="truncate text-[11px] text-white/60">Bảng điều khiển</p>
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={toggleSidebarCollapsed}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-[var(--radius-control)] text-white/70 hover:bg-white/10 hover:text-white',
                    sidebarCollapsed && 'mx-auto',
                  )}
                  aria-label={sidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
                  id="sidebar-toggle"
                />
              }
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen {...icon('control')} aria-hidden />
              ) : (
                <PanelLeftClose {...icon('control')} aria-hidden />
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            </TooltipContent>
          </Tooltip>
        </div>

        <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              title={item.title}
              icon={item.icon}
              isActive={
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              }
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="border-t border-[var(--sidebar-border)] py-2">
          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              title={item.title}
              icon={item.icon}
              isActive={pathname === item.href}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
