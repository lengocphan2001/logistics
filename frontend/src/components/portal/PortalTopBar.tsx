'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Search, User, Wallet } from 'lucide-react';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useAuthStore } from '@/stores/auth.store';
import { portalConfig } from '@/config/portal.config';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';
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
  const [term, setTerm] = useState('');

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

  const rateLabel = `1¥ = ${formatVnd(vndPerCny).replace('₫', '').trim()}đ`;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const searchField = (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <Search
        {...icon('inline')}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--graphite)]"
      />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Tìm sản phẩm trên Taobao, 1688, JD"
        aria-label="Tìm sản phẩm"
        className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--rule-strong)] bg-[var(--dock-grey)] pl-9 pr-3 text-base text-[var(--ink)] outline-none sm:text-sm placeholder:text-[var(--graphite)]/75 hover:border-[var(--graphite)] focus-visible:border-[var(--manifest-navy)] focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]"
      />
    </form>
  );

  return (
    <header className="border-b border-[var(--rule)] bg-[var(--sheet-white)]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href={portalConfig.brand.homeHref}
          className="flex shrink-0 items-baseline gap-2"
        >
          <span className="font-heading text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ink)]">
            {portalConfig.brand.name}
          </span>
          <span className="hidden text-xs text-[var(--graphite)] lg:inline">
            {portalConfig.brand.tagline}
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">{searchField}</div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <dl className="hidden items-center gap-4 text-xs sm:flex">
            <div className="text-right">
              <dt className="text-[var(--graphite)]">Tỉ giá</dt>
              <dd
                data-numeric
                className="font-semibold text-[var(--ink)]"
              >
                {rateLoading ? (
                  <Skeleton className="inline-block h-4 w-20 align-middle" />
                ) : (
                  rateLabel
                )}
              </dd>
            </div>
            <div className="h-8 w-px bg-[var(--rule)]" aria-hidden />
            <div className="text-right">
              <dt className="text-[var(--graphite)]">Số dư ví</dt>
              <dd data-numeric className="font-semibold text-[var(--ink)]">
                {profileLoading ? (
                  <Skeleton className="inline-block h-4 w-16 align-middle" />
                ) : (
                  <>
                    {formatCny(balance)}
                    <span className="ml-1.5 hidden font-normal text-[var(--graphite)] lg:inline">
                      ≈ {formatVnd(cnyToVnd(balance, vndPerCny))}
                    </span>
                  </>
                )}
              </dd>
            </div>
          </dl>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-1.5 py-1 outline-none hover:bg-[var(--wash)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]">
              <Avatar className="size-8 rounded-[var(--radius-control)]">
                <AvatarFallback className="rounded-[var(--radius-control)] bg-[var(--navy-wash)] text-[11px] font-bold text-[var(--manifest-navy)]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[150px] truncate text-sm font-medium text-[var(--ink)] lg:block">
                {profile?.name || user?.name || 'Khách hàng'}
              </span>
              <ChevronDown
                {...icon('inline')}
                aria-hidden
                className="hidden text-[var(--graphite)] lg:block"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* The header strip hides rate and balance on phones; they live here instead. */}
              <dl className="mb-1 space-y-1 border-b border-[var(--rule)] px-2 pb-2 pt-1.5 text-xs sm:hidden">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--graphite)]">Số dư ví</dt>
                  <dd data-numeric className="font-semibold text-[var(--ink)]">
                    {profileLoading ? '—' : formatCny(balance)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--graphite)]">Tỉ giá</dt>
                  <dd data-numeric className="font-semibold text-[var(--ink)]">
                    {rateLoading ? '—' : rateLabel}
                  </dd>
                </div>
              </dl>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User {...icon('inline')} aria-hidden />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/wallet')}>
                <Wallet {...icon('inline')} aria-hidden />
                Ví và nạp rút
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut {...icon('inline')} aria-hidden />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search keeps its own row on phones instead of collapsing behind an icon. */}
      <div className="border-t border-[var(--rule)] px-4 py-2.5 md:hidden">
        {searchField}
      </div>
    </header>
  );
}
