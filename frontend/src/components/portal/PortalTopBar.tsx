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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href={portalConfig.brand.homeHref} className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] shadow-sm">
            <Package className="h-4 w-4 text-[var(--brand-hero-text)]" />
          </div>
          <div className="leading-tight hidden xs:block sm:block">
            <p className="text-sm font-bold text-[var(--portal-foreground)]">{portalConfig.brand.name}</p>
            <p className="text-[11px] text-[var(--portal-muted)]">{portalConfig.brand.tagline}</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
          <div className="rounded-lg border border-[var(--portal-border)] bg-white/60 px-3 py-1.5">
            <span className="text-[var(--portal-muted)]">Tỉ giá: </span>
            {rateLoading ? (
              <Skeleton className="inline-block h-4 w-24 align-middle" />
            ) : (
              <span className="font-semibold text-[var(--portal-foreground)]">
                1¥ = {formatVnd(vndPerCny).replace('₫', '').trim()}đ
              </span>
            )}
          </div>

          <div className="rounded-lg border border-[var(--portal-border)] bg-white/60 px-3 py-1.5">
            <span className="text-[var(--portal-muted)]">Số dư: </span>
            {profileLoading ? (
              <Skeleton className="inline-block h-4 w-20 align-middle" />
            ) : (
              <span className="font-bold text-[var(--brand-accent)]">{formatCny(balance)}</span>
            )}
            {!profileLoading && (
              <span className="ml-1.5 hidden text-xs text-[var(--portal-muted)] md:inline">
                (≈ {formatVnd(cnyToVnd(balance, vndPerCny))})
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-[var(--portal-border)] bg-white/70 px-2 py-1.5 outline-none hover:bg-white">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[var(--brand-primary)]/15 text-xs font-bold text-[var(--brand-accent)]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block max-w-[140px]">
                <p className="truncate text-sm font-semibold leading-tight">
                  {profile?.name || user?.name || 'Khách hàng'}
                </p>
                <p className="truncate text-[11px] text-[var(--portal-muted)]">Khách hàng</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[var(--portal-muted)]" />
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
