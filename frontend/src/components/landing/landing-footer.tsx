import Link from 'next/link';
import { Mail, MapPin, Package, Phone } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--brand-border)] bg-[oklch(0.96_0.022_86)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/25">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Taman Logistics</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--landing-subtle)]">
              Nền tảng logistics Trung Quốc — Việt Nam: ký gửi, mua hộ, thanh toán hộ và theo dõi đơn
              hàng realtime trên một hệ thống.
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-foreground">Liên kết</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-[var(--landing-subtle)] hover:text-primary transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[var(--landing-subtle)] hover:text-primary transition-colors">
                  Đăng ký
                </Link>
              </li>
              <li>
                <a href="#dich-vu" className="text-[var(--landing-subtle)] hover:text-primary transition-colors">
                  Dịch vụ
                </a>
              </li>
              <li>
                <a href="#tra-cuu" className="text-[var(--landing-subtle)] hover:text-primary transition-colors">
                  Tra cứu vận đơn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold text-foreground">Liên hệ</p>
            <ul className="space-y-3 text-sm text-[var(--landing-subtle)]">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:support@tamanlogistics.vn" className="hover:text-primary transition-colors">
                  support@tamanlogistics.vn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>1900 xxxx</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/70 pt-8 text-xs text-[var(--landing-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Taman Logistics. All rights reserved.</p>
          <p className="font-medium text-foreground/70">tamanlogistics.vn</p>
        </div>
      </div>
    </footer>
  );
}
