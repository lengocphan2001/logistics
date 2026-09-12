'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { icon } from '@/lib/icon';

const links = [
  { href: '#dich-vu', label: 'Dịch vụ' },
  { href: '#quy-trinh', label: 'Quy trình' },
  { href: '#tra-cuu', label: 'Tra cứu' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass =
    'text-sm font-medium text-[var(--graphite)] hover:text-[var(--ink)]';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b bg-[var(--sheet-white)]',
        scrolled ? 'border-[var(--rule)]' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-heading text-[1.0625rem] font-bold tracking-[-0.02em] text-[var(--ink)]">
            Taman Logistics
          </span>
          <span className="hidden text-xs text-[var(--graphite)] sm:inline">
            Trung Quốc và Việt Nam
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/dashboard" className={buttonVariants({ size: 'sm' })}>
              Vào cổng khách hàng
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Đăng nhập
              </Link>
              <Link href="/register" className={buttonVariants({ size: 'sm' })}>
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--rule-strong)] text-[var(--ink)]"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
        >
          {open ? (
            <X {...icon('control')} aria-hidden />
          ) : (
            <Menu {...icon('control')} aria-hidden />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--rule)] bg-[var(--sheet-white)] md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--wash)]"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--rule)] pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className={buttonVariants()} onClick={() => setOpen(false)}>
                  Vào cổng khách hàng
                </Link>
              ) : (
                <>
                  <Link href="/login" className={buttonVariants({ variant: 'outline' })} onClick={() => setOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link href="/register" className={buttonVariants()} onClick={() => setOpen(false)}>
                    Đăng ký miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
