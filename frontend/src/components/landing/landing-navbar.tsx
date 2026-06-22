'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { easeOut } from '@/lib/motion';

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

  const linkClass = cn(
    'text-sm font-medium transition-colors',
    scrolled ? 'text-[var(--landing-subtle)] hover:text-foreground' : 'text-[var(--landing-body)] hover:text-primary',
  );

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/95 shadow-sm backdrop-blur-xl'
          : 'border-b border-[var(--brand-border)]/50 bg-[var(--brand-surface)]/70 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">Taman Logistics</p>
            <p className="text-[11px] font-medium text-[var(--landing-subtle)] hidden sm:block">
              Trung Quốc → Việt Nam
            </p>
          </div>
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
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/70 bg-background/98 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/70"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-4">
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
        </motion.div>
      )}
    </motion.header>
  );
}
