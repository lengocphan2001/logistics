'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { portalConfig, type PortalNavItem } from '@/config/portal.config';
import { portalNavIcons } from '@/components/portal/icon-map';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';

function parseNavHref(href: string) {
  const [path, query = ''] = href.split('?');
  return { path, params: new URLSearchParams(query) };
}

/** Một mục active khi path (+ query nếu có) khớp, không đè lên mục cụ thể hơn cùng path. */
function isNavActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: PortalNavItem,
  siblings: PortalNavItem[],
): boolean {
  const { path: itemPath, params: itemParams } = parseNavHref(item.href);
  const itemHasQuery = [...itemParams.keys()].length > 0;

  if (itemHasQuery) {
    if (pathname !== itemPath) return false;
    for (const [key, value] of itemParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  const pathMatches = item.exact
    ? pathname === itemPath
    : pathname === itemPath ||
      (itemPath !== '/' && pathname.startsWith(`${itemPath}/`));

  if (!pathMatches) return false;

  // Cùng path nhưng mục khác có query khớp URL → ưu tiên mục có query
  for (const other of siblings) {
    if (other.href === item.href) continue;
    const { path: otherPath, params: otherParams } = parseNavHref(other.href);
    if (otherPath !== itemPath || [...otherParams.keys()].length === 0) continue;

    let otherQueryMatches = true;
    for (const [key, value] of otherParams.entries()) {
      if (searchParams.get(key) !== value) otherQueryMatches = false;
    }
    if (otherQueryMatches) return false;
  }

  // Path con dài hơn (vd. /wallet/transactions) → không active /wallet
  for (const other of siblings) {
    if (other.href === item.href) continue;
    const { path: otherPath } = parseNavHref(other.href);
    if (otherPath.length <= itemPath.length) continue;
    if (
      otherPath.startsWith(`${itemPath}/`) &&
      (pathname === otherPath || pathname.startsWith(`${otherPath}/`))
    ) {
      return false;
    }
  }

  return true;
}

export function PortalNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navItems = portalConfig.nav;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { fetchCart, itemCount } = useCartStore();
  const cartCount = useCartStore((s) => s.itemCount());

  // Load cart count once authenticated
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  return (
    <nav className="portal-nav-bar border-b border-[var(--brand-primary-dark)]/20 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0.5 overflow-x-auto py-1 scrollbar-none sm:gap-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = isNavActive(pathname, searchParams, item, navItems);
            const Icon = portalNavIcons[item.icon];
            const isCart = item.href === '/cart';
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-sm',
                  active
                    ? 'bg-white/20 text-[var(--brand-hero-text)] shadow-sm'
                    : 'text-[var(--brand-hero-text)]/85 hover:bg-white/10 hover:text-[var(--brand-hero-text)]',
                )}
              >
                <span className="relative">
                  <Icon className="h-4 w-4 shrink-0" />
                  {isCart && cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden min-[480px]:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
