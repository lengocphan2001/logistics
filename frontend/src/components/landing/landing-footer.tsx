import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { icon } from '@/lib/icon';

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--rule)] bg-[var(--dock-grey)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <span className="font-heading text-base font-bold text-[var(--ink)]">
              Taman Logistics
            </span>
            <p data-prose className="text-sm">
              Nền tảng logistics giữa Trung Quốc và Việt Nam. Ký gửi, mua hộ, thanh
              toán hộ và theo dõi đơn hàng trên một hệ thống.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-heading text-sm font-semibold text-[var(--ink)]">Liên kết</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-[var(--graphite)] hover:text-[var(--manifest-navy)] hover:underline">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[var(--graphite)] hover:text-[var(--manifest-navy)] hover:underline">
                  Đăng ký
                </Link>
              </li>
              <li>
                <a href="#dich-vu" className="text-[var(--graphite)] hover:text-[var(--manifest-navy)] hover:underline">
                  Dịch vụ
                </a>
              </li>
              <li>
                <a href="#tra-cuu" className="text-[var(--graphite)] hover:text-[var(--manifest-navy)] hover:underline">
                  Tra cứu vận đơn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-heading text-sm font-semibold text-[var(--ink)]">Liên hệ</h2>
            <ul className="space-y-3 text-sm text-[var(--graphite)]">
              <li className="flex items-start gap-2">
                <MapPin {...icon('inline')} aria-hidden className="mt-0.5 shrink-0" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail {...icon('inline')} aria-hidden className="shrink-0" />
                <a href="mailto:support@tamanlogistics.vn" className="hover:text-[var(--manifest-navy)] hover:underline">
                  support@tamanlogistics.vn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone {...icon('inline')} aria-hidden className="shrink-0" />
                <span>1900 xxxx</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--rule)] pt-8 text-xs text-[var(--graphite)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Taman Logistics. All rights reserved.</p>
          <p className="font-medium text-[var(--ink)]">tamanlogistics.vn</p>
        </div>
      </div>
    </footer>
  );
}
