'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { portalConfig, type PortalNavItem } from '@/config/portal.config';
import { portalNavIcons } from '@/components/portal/icon-map';
import { icon } from '@/lib/icon';
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

/** Beats once when the cart total grows — the other half of the add-to-cart confirmation. */
function useTally(count: number) {
  const previous = useRef(count);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (count > previous.current) setBeat((n) => n + 1);
    previous.current = count;
  }, [count]);

  return beat;
}

export function PortalNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navItems = portalConfig.nav;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { fetchCart } = useCartStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const beat = useTally(cartCount);

  // Load cart count once authenticated
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  return (
    <nav
      data-chrome
      aria-label="Điều hướng chính"
      className="portal-nav-bar border-b border-[var(--navy-deep)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto scroll-x-clean">
          {navItems.map((item) => {
            const active = isNavActive(pathname, searchParams, item, navItems);
            const Icon = portalNavIcons[item.icon];
            const isCart = item.href === '/cart';
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium sm:px-4',
                    active
                      ? 'border-white text-white'
                      : 'border-transparent text-white/70 hover:text-white',
                  )}
                >
                  <span className="relative">
                    <Icon {...icon('control')} aria-hidden />
                    {isCart && cartCount > 0 && (
                      <span
                        key={beat}
                        className="dock-tally absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--seal-red)] px-1 text-[10px] font-bold text-white"
                      >
                        <span data-numeric>{cartCount > 99 ? '99+' : cartCount}</span>
                      </span>
                    )}
                  </span>
                  <span className="hidden min-[480px]:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
