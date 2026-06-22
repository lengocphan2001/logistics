'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  History,
  User,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Đơn hàng', href: '/orders', icon: Package },
  { title: 'Nạp / Rút ví', href: '/wallet', icon: Wallet },
  { title: 'Lịch sử giao dịch', href: '/wallet/transactions', icon: History },
  { title: 'Hồ sơ', href: '/profile', icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">Logistics</p>
          <p className="text-xs text-muted-foreground truncate">{user?.name || user?.email}</p>
        </div>
        <button
          className="ml-auto lg:hidden p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-card border-r border-border shrink-0">
        {navContent}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function PortalHeader({ title }: { title?: string }) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <header className="flex items-center gap-3 h-14 px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
      <button
        className="lg:hidden p-2 -ml-2 text-muted-foreground"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      {title && <h1 className="text-lg font-semibold">{title}</h1>}
    </header>
  );
}
