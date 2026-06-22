'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { portalConfig, type PortalNavItem } from '@/config/portal.config';
import { portalNavIcons } from '@/components/portal/icon-map';

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

  return (
    <nav className="portal-nav-bar border-b border-[var(--brand-primary-dark)]/20 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = isNavActive(pathname, searchParams, item, navItems);
            const Icon = portalNavIcons[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/20 text-[var(--brand-hero-text)] shadow-sm'
                    : 'text-[var(--brand-hero-text)]/85 hover:bg-white/10 hover:text-[var(--brand-hero-text)]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
