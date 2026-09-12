'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  heroTitle: React.ReactNode;
  heroSubtitle: string;
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Two panels, split by a straight edge: the navy side states who the product
 * is for, the white side holds the form. No curve, no glow, no entry
 * animation — the form is the point.
 */
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
        <div
          data-chrome
          className="auth-hero relative shrink-0 lg:flex lg:min-h-screen lg:w-[42%]"
        >
          <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:h-full lg:px-14">
            <Link href="/" className="mb-10 inline-flex items-baseline gap-2 lg:mb-14">
              <span className="font-heading text-[1.0625rem] font-bold tracking-[-0.02em] text-white">
                Taman Logistics
              </span>
              <span className="text-xs text-white/75">Trung Quốc và Việt Nam</span>
            </Link>

            <h2 className="max-w-md text-3xl font-bold leading-tight text-white sm:text-4xl">
              {heroTitle}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
              {heroSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className={cn('mx-auto w-full max-w-md lg:max-w-lg', className)}>
            <div className="mb-7 border-b border-[var(--rule)] pb-5">
              <h1 className="text-2xl font-bold text-[var(--ink)]">{formTitle}</h1>
              <p className="mt-1 text-sm text-[var(--graphite)]">{formSubtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
