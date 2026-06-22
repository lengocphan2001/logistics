'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe2,
  Headphones,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeIn, fadeUp, scaleIn, useMotionSafe } from '@/lib/motion';
import { useAuthStore } from '@/stores/auth.store';

const platforms = ['Taobao', '1688', 'Tmall', 'Alibaba'];

const features = [
  {
    icon: Box,
    title: 'Ký gửi hàng',
    desc: 'Gửi hàng từ Trung Quốc về Việt Nam với quy trình minh bạch, cân đo chuẩn xác và báo phí rõ ràng.',
    accent: 'from-amber-500/18 to-amber-500/5 border-amber-600/22',
    iconClass: 'bg-amber-500/15 text-amber-800',
  },
  {
    icon: Sparkles,
    title: 'Mua hộ & thanh toán hộ',
    desc: 'Đặt hàng, thanh toán đơn Tmall/Taobao/1688 — đội ngũ xử lý mua và kiểm tra hàng giúp bạn.',
    accent: 'from-yellow-600/15 to-yellow-600/5 border-yellow-700/20',
    iconClass: 'bg-yellow-600/12 text-yellow-800',
  },
  {
    icon: Wallet,
    title: 'Ví ¥ thông minh',
    desc: 'Nạp/rút ví CNY, lịch sử giao dịch chi tiết và thanh toán đơn hàng chỉ với vài thao tác.',
    accent: 'from-orange-500/15 to-orange-500/5 border-orange-600/20',
    iconClass: 'bg-orange-500/12 text-orange-800',
  },
  {
    icon: Truck,
    title: 'Theo dõi realtime',
    desc: 'Cập nhật trạng thái từ kho Trung Quốc đến kho Việt Nam và giao tận tay khách hàng.',
    accent: 'from-stone-500/12 to-stone-500/5 border-stone-600/18',
    iconClass: 'bg-stone-500/12 text-stone-700',
  },
];

const steps = [
  {
    step: '01',
    title: 'Đăng ký & nạp ví',
    desc: 'Tạo tài khoản miễn phí, cập nhật hồ sơ nhận hàng và nạp số dư ¥ để sẵn sàng đặt hàng.',
  },
  {
    step: '02',
    title: 'Tạo đơn / ký gửi',
    desc: 'Gửi link sản phẩm hoặc mã vận đơn TQ — hệ thống ghi nhận, báo phí và xử lý ngay.',
  },
  {
    step: '03',
    title: 'Theo dõi & nhận hàng',
    desc: 'Theo dõi hành trình đơn hàng, thanh toán phí cuối và nhận hàng tại Việt Nam.',
  },
];

const stats = [
  { value: '10K+', label: 'Đơn hàng xử lý', icon: Package },
  { value: '99.2%', label: 'Giao đúng hạn', icon: CheckCircle2 },
  { value: '24/7', label: 'Hỗ trợ khách hàng', icon: Headphones },
  { value: '2-5 ngày', label: 'Vận chuyển nhanh', icon: Clock },
];

const highlights = [
  'Phí minh bạch, không phát sinh bất ngờ',
  'Kho tại Quảng Châu & Hà Nội',
  'Đối soát cân nặng & hoàn tiền khi sai lệch',
];

function HeroVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="landing-orb landing-orb-a" aria-hidden />
      <div className="landing-orb landing-orb-b" aria-hidden />

      <motion.div
        {...scaleIn(reduced, 0.1)}
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xl shadow-primary/8"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-primary-dark)] via-[var(--brand-primary)] to-[oklch(0.72_0.1_85)]" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <span className="text-xs font-semibold text-[var(--landing-body)]">Đang vận chuyển</span>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/8 font-mono text-primary">
            VN-28491
          </Badge>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Kho Quảng Châu', sub: 'Đã xuất kho · 12/06', done: true },
            { label: 'Đang về kho Hà Nội', sub: 'Dự kiến 2 ngày nữa', done: true, active: true },
            { label: 'Giao hàng tận nơi', sub: 'Chờ xác nhận địa chỉ', done: false },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.45 }}
              className="flex items-start gap-3"
            >
              <div
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                  item.active
                    ? 'border-primary bg-primary/12 text-primary'
                    : item.done
                      ? 'border-amber-600/55 bg-amber-500/12 text-amber-700'
                      : 'border-border bg-muted text-[var(--landing-subtle)]',
                )}
              >
                {item.done ? <ShieldCheck className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-[var(--landing-subtle)]">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/50 p-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--landing-subtle)]">
              Cân nặng
            </p>
            <p className="mt-0.5 text-sm font-bold text-foreground">3.2 kg</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--landing-subtle)]">
              Phí vận chuyển
            </p>
            <p className="mt-0.5 text-sm font-bold text-primary">¥ 48.50</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { reduced } = useMotionSafe();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [trackingCode, setTrackingCode] = useState('');

  const hero = fadeUp(reduced);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingCode.trim();
    if (!code) return;
    const path = `/tracking/${encodeURIComponent(code)}`;
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="landing-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-[oklch(0.62_0.12_80/14%)] via-[oklch(0.58_0.11_78/6%)] to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
            <div>
              <motion.div
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0 }}
              >
                <span className="landing-section-label">
                  <Globe2 className="h-3.5 w-3.5" />
                  Logistics Trung Quốc → Việt Nam
                </span>
              </motion.div>

              <motion.h1
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0.08 }}
                className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
              >
                Vận chuyển quốc tế
                <span className="mt-1 block landing-gradient-text">mượt mà & minh bạch</span>
              </motion.h1>

              <motion.p
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0.16 }}
                className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--landing-body)]"
              >
                Taman Logistics giúp bạn ký gửi, mua hộ và quản lý ví ¥ trên một nền tảng — theo dõi
                đơn hàng mọi lúc, mọi nơi.
              </motion.p>

              <motion.div
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0.2 }}
                className="mt-5 flex flex-wrap gap-2"
              >
                {platforms.map((name) => (
                  <span
                    key={name}
                    className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-semibold text-[var(--landing-body)] shadow-sm"
                  >
                    {name}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0.24 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: 'lg' }), 'gap-2 shadow-lg shadow-primary/25')}
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  Đăng nhập
                </Link>
              </motion.div>

              <motion.ul
                initial={hero.initial}
                animate={hero.animate}
                transition={{ ...hero.transition, delay: 0.32 }}
                className="mt-8 space-y-2"
              >
                {highlights.map((text) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-[var(--landing-body)]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700" />
                    {text}
                  </li>
                ))}
              </motion.ul>
            </div>

            <HeroVisual reduced={reduced} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/70 bg-[var(--brand-surface-muted)]/80">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((item, i) => (
            <motion.div
              key={item.label}
              {...fadeIn(reduced, i * 0.05)}
              className="flex flex-col items-center gap-2 text-center md:items-start md:text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{item.value}</p>
              <p className="text-sm font-medium text-[var(--landing-subtle)]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="dich-vu" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(reduced)} className="mx-auto max-w-2xl text-center">
            <span className="landing-section-label">Dịch vụ</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Giải pháp toàn diện
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--landing-body)]">
              Phù hợp cá nhân mua lẻ lẫn shop kinh doanh hàng Trung Quốc tại Việt Nam.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...scaleIn(reduced, i * 0.08)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8',
                  f.accent,
                )}
              >
                <div
                  className={cn(
                    'mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                    f.iconClass,
                  )}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--landing-body)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="quy-trinh" className="scroll-mt-24 bg-[oklch(0.96_0.022_86)] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(reduced)} className="mx-auto max-w-2xl text-center">
            <span className="landing-section-label">Quy trình</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Chỉ 3 bước đơn giản
            </h2>
            <p className="mt-4 text-base text-[var(--landing-body)]">
              Rõ ràng từ lúc đặt hàng đến khi nhận — bạn luôn biết đơn đang ở đâu.
            </p>
          </motion.div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                {...fadeIn(reduced, i * 0.1)}
                className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/30">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--landing-body)]">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-primary/30 md:block" aria-hidden />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/70 bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm sm:px-6 lg:px-8">
          {[
            { icon: Star, text: '4.9/5 đánh giá khách hàng' },
            { icon: Zap, text: 'Xử lý đơn trong 24h' },
            { icon: CreditCard, text: 'Thanh toán ví ¥ an toàn' },
            { icon: ShieldCheck, text: 'Bảo mật thông tin cá nhân' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 font-medium text-[var(--landing-body)]">
              <Icon className="h-4 w-4 text-primary" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Tracking */}
      <section id="tra-cuu" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...scaleIn(reduced)}
            className="overflow-hidden rounded-3xl border border-[oklch(0.58_0.11_78/22%)] bg-gradient-to-br from-[oklch(0.62_0.12_80/12%)] via-card to-[var(--brand-surface)] p-8 shadow-lg shadow-[oklch(0.46_0.095_72/8%)] sm:p-12"
          >
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Tra cứu vận đơn</h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--landing-body)]">
                Nhập mã vận đơn để xem trạng thái. Đăng nhập để xem chi tiết đầy đủ hành trình đơn hàng.
              </p>

              <form onSubmit={handleTrack} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Input
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="VD: VN-28491 hoặc mã bill of lading..."
                  className="h-11 flex-1 border-border/80 bg-background text-foreground placeholder:text-[var(--landing-subtle)]"
                />
                <Button type="submit" size="lg" className="shrink-0 gap-2 sm:px-8">
                  Tra cứu
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeIn(reduced)}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-primary-dark)] via-[var(--brand-primary)] to-[oklch(0.52_0.1_82)] px-8 py-14 text-center sm:px-16"
          >
            <div className="landing-grid absolute inset-0 opacity-10" aria-hidden />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[oklch(0.78_0.1_85/35%)] blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Sẵn sàng bắt đầu?</h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/85">
                Tạo tài khoản miễn phí và trải nghiệm nền tảng logistics hiện đại ngay hôm nay.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'min-w-[180px] bg-white text-[var(--brand-primary-dark)] hover:bg-white/92',
                  )}
                >
                  Đăng ký ngay
                </Link>
                <Link
                  href={isAuthenticated ? '/dashboard' : '/login'}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'min-w-[180px] border border-white/40 bg-transparent text-white hover:bg-white/12',
                  )}
                >
                  {isAuthenticated ? 'Vào dashboard' : 'Đăng nhập'}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
