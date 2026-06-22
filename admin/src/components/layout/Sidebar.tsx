'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Warehouse,
  UserCog,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

const bottomItems = [
  { title: 'Cài đặt', href: '/settings', icon: Settings },
];

interface NavLinkProps {
  href: string;
  title: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
}

function NavLink({ href, title, icon: Icon, isActive, collapsed }: NavLinkProps) {
  const inner = (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group w-full',
        isActive
          ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
      )}
    >
      <Icon
        className={cn(
          'w-[18px] h-[18px] shrink-0 transition-colors',
          isActive
            ? 'text-sidebar-primary'
            : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-l-full"
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={inner} />
        <TooltipContent side="right">{title}</TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role?.toUpperCase() || '';

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <TooltipProvider delay={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col h-screen bg-sidebar border-r border-sidebar-border shadow-sm shrink-0 overflow-hidden z-30"
      >
        {/* ── Logo + Toggle ── */}
        <div className="flex items-center h-16 px-3 border-b border-sidebar-border shrink-0">
          {/* Logo mark — always visible */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0"
          >
            <Zap className="w-4 h-4 text-primary-foreground" />
          </Link>

          {/* Brand name — hide when collapsed */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="ml-3 overflow-hidden flex-1 min-w-0"
              >
                <p className="text-sidebar-foreground font-semibold text-sm leading-tight whitespace-nowrap tracking-tight">
                  Logistics
                </p>
                <p className="text-sidebar-foreground/65 text-[11px] whitespace-nowrap">
                  Admin Panel
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle — always at the right of the header row */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={toggleSidebarCollapsed}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-150 shrink-0',
                    sidebarCollapsed ? 'mx-auto' : 'ml-auto'
                  )}
                  aria-label={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                  id="sidebar-toggle"
                />
              }
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            );
          })}
        </nav>

        {/* ── Bottom ── */}
        <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            );
          })}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
