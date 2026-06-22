'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  heroTitle: React.ReactNode;
  heroSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({
  heroTitle,
  heroSubtitle,
  formTitle,
  formSubtitle,
  children,
  className,
}: AuthShellProps) {
  return (
    <div className="auth-page min-h-screen bg-[var(--auth-surface)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Brown-gold hero */}
        <div className="auth-hero relative shrink-0 overflow-hidden lg:flex lg:w-[46%] lg:min-h-screen lg:rounded-none lg:pb-0">
          <div className="auth-hero-glow pointer-events-none" aria-hidden />

          <div className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-10 sm:px-10 lg:h-full lg:px-14 lg:pb-16 lg:pt-16">
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:mb-14">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 shadow-sm ring-1 ring-white/20">
                <Package className="h-5 w-5 text-[var(--auth-hero-text)]" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-[var(--auth-hero-text)]">Taman Logistics</p>
                <p className="text-[11px] font-medium text-[var(--auth-hero-muted)]">Trung Quốc → Việt Nam</p>
              </div>
            </Link>

            <h2 className="max-w-md text-3xl font-bold leading-tight text-[var(--auth-hero-text)] sm:text-4xl">
              {heroTitle}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--auth-hero-muted)]">
              {heroSubtitle}
            </p>
          </div>

          {/* Curved bottom edge (mobile / tablet) */}
          <div className="auth-hero-curve lg:hidden" aria-hidden />
        </div>

        {/* Form area — overlaps curved hero edge on mobile */}
        <div className="relative -mt-5 flex flex-1 flex-col justify-center px-5 pb-10 sm:px-8 lg:mt-0 lg:px-12 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cn(
              'auth-form-card mx-auto w-full max-w-md bg-card p-6  sm:p-8 lg:max-w-lg lg:shadow-xl',
              className,
            )}
          >
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-foreground">{formTitle}</h1>
              <p className="mt-1 text-sm text-[var(--auth-body-muted)]">{formSubtitle}</p>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
