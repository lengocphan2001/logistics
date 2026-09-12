'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ShipmentExample } from '@/components/landing/shipment-example';
import {
  highlights,
  platforms,
  services,
  stats,
  steps,
} from '@/components/landing/landing-content';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="landing-grid absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="landing-section-label">Logistics Trung Quốc và Việt Nam</span>

            <h1 className="mt-6 text-4xl font-bold text-[var(--ink)] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
              Vận chuyển quốc tế mượt mà và minh bạch
            </h1>

            <p data-prose className="mt-6 text-lg">
              Taman Logistics giúp bạn ký gửi, mua hộ và quản lý ví nhân dân tệ trên một
              nền tảng, theo dõi đơn hàng mọi lúc mọi nơi.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {platforms.map((name) => (
                <li
                  key={name}
                  className="border border-[var(--rule)] px-2.5 py-1 text-xs font-semibold text-[var(--graphite)]"
                >
                  {name}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className={buttonVariants({ size: 'lg' })}>
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Đăng nhập
              </Link>
            </div>

            <ul className="mt-8 space-y-2">
              {highlights.map((text) => (
                <li key={text} className="flex items-center gap-2 text-sm text-[var(--graphite)]">
                  <CheckCircle2
                    {...icon('inline')}
                    aria-hidden
                    className="shrink-0 text-[var(--ledger-green)]"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <ShipmentExample />
        </div>
      </div>
    </section>
  );
}

export function LandingStats() {
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--dock-grey)]">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((item) => (
          <div key={item.label}>
            <dt className="sr-only">{item.label}</dt>
            <dd>
              <span
                data-numeric
                className="block text-2xl font-bold text-[var(--ink)] sm:text-3xl"
              >
                {item.value}
              </span>
              <span className="mt-1 block text-sm text-[var(--graphite)]">{item.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function LandingServices() {
  return (
    <section id="dich-vu" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="landing-section-label">Dịch vụ</span>
          <h2 className="mt-4 text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            Giải pháp toàn diện
          </h2>
          <p data-prose className="mt-4 text-base">
            Phù hợp cá nhân mua lẻ lẫn shop kinh doanh hàng Trung Quốc tại Việt Nam.
          </p>
        </div>

        <div className="mt-12 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.title} className="bg-[var(--sheet-white)] p-6">
              <service.icon
                {...icon('control')}
                aria-hidden
                className="text-[var(--manifest-navy)]"
              />
              <h3 className="mt-3 font-heading text-lg font-semibold text-[var(--ink)]">
                {service.title}
              </h3>
              <p data-prose className="mt-2 text-sm">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSteps() {
  return (
    <section
      id="quy-trinh"
      className="scroll-mt-24 border-y border-[var(--rule)] bg-[var(--dock-grey)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="landing-section-label">Quy trình</span>
          <h2 className="mt-4 text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            Ba bước từ đặt hàng đến nhận hàng
          </h2>
        </div>

        {/* Genuinely sequential, so it is an ordered list — but the order is
            carried by position and a rule, not by a zero-padded numeral. */}
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.title} className="border-t-2 border-[var(--manifest-navy)] pt-4">
              <h3 className="font-heading text-lg font-semibold text-[var(--ink)]">
                {s.title}
              </h3>
              <p data-prose className="mt-2 text-sm">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function LandingCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--manifest-navy)] px-8 py-14 text-center sm:px-16" data-chrome>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Sẵn sàng bắt đầu?</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/85">
            Tạo tài khoản miễn phí và dùng thử nền tảng ngay hôm nay.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-w-[180px] bg-white text-[var(--manifest-navy)] hover:bg-white/90',
              )}
            >
              Đăng ký ngay
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-w-[180px] border border-white/50 bg-transparent text-white hover:bg-white/10',
              )}
            >
              {isAuthenticated ? 'Vào trang quản lý' : 'Đăng nhập'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
