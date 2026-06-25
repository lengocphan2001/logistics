'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Package, User, Wallet } from 'lucide-react';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useAuthStore } from '@/stores/auth.store';
import { portalConfig } from '@/config/portal.config';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationBell } from '@/components/portal/NotificationBell';

export function PortalTopBar() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { vndPerCny, loading: rateLoading } = useExchangeRate();
  const { profile, loading: profileLoading } = useCustomerProfile();

  const balance = Number(profile?.balance ?? 0);
  const initials = (profile?.name || user?.name || 'K')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="border-b border-[var(--portal-border)] bg-[var(--portal-topbar)]">
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5 lg:px-8">
        <Link href={portalConfig.brand.homeHref} className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] shadow-sm sm:h-9 sm:w-9">
            <Package className="h-4 w-4 text-[var(--brand-hero-text)]" />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold text-[var(--portal-foreground)]">{portalConfig.brand.name}</p>
            <p className="text-[11px] text-[var(--portal-muted)]">{portalConfig.brand.tagline}</p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-nowrap items-center justify-end gap-1.5 text-xs sm:gap-3 sm:text-sm">
          <div className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--portal-border)] bg-white/60 px-2 py-1 sm:px-3 sm:py-1.5">
            <span className="hidden text-[var(--portal-muted)] sm:inline">Tỉ giá: </span>
            {rateLoading ? (
              <Skeleton className="inline-block h-3.5 w-14 align-middle sm:h-4 sm:w-24" />
            ) : (
              <span className="font-semibold text-[var(--portal-foreground)]">
                <span className="sm:hidden">1¥={formatVnd(vndPerCny).replace('₫', '').trim()}đ</span>
                <span className="hidden sm:inline">
                  1¥ = {formatVnd(vndPerCny).replace('₫', '').trim()}đ
                </span>
              </span>
            )}
          </div>

          <div className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--portal-border)] bg-white/60 px-2 py-1 sm:px-3 sm:py-1.5">
            <span className="hidden text-[var(--portal-muted)] sm:inline">Số dư: </span>
            {profileLoading ? (
              <Skeleton className="inline-block h-3.5 w-12 align-middle sm:h-4 sm:w-20" />
            ) : (
              <span className="font-bold text-[var(--brand-accent)]">{formatCny(balance)}</span>
            )}
            {!profileLoading && (
              <span className="ml-1.5 hidden text-xs text-[var(--portal-muted)] md:inline">
                (≈ {formatVnd(cnyToVnd(balance, vndPerCny))})
              </span>
            )}
          </div>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--portal-border)] bg-white/70 p-1 outline-none hover:bg-white sm:gap-2 sm:px-2 sm:py-1.5">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-[var(--brand-primary)]/15 text-[10px] font-bold text-[var(--brand-accent)] sm:text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden max-w-[140px] text-left sm:block">
                <p className="truncate text-sm font-semibold leading-tight">
                  {profile?.name || user?.name || 'Khách hàng'}
                </p>
                <p className="truncate text-[11px] text-[var(--portal-muted)]">Khách hàng</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-[var(--portal-muted)] sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="h-4 w-4" />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/wallet')}>
                <Wallet className="h-4 w-4" />
                Ví & nạp/rút
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
