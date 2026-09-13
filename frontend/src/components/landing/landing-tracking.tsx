'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { icon } from '@/lib/icon';

/** Public tracking entry. Holding the code is enough; no sign-in required. */
export function LandingTracking() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingCode.trim();
    if (!code) return;
    router.push(`/tracking/${encodeURIComponent(code)}`);
  };

  return (
    <section id="tra-cuu" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <Search {...icon('page')} aria-hidden className="mx-auto text-[var(--manifest-navy)]" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--ink)] sm:text-3xl">
          Tra cứu vận đơn
        </h2>
        <p data-prose className="mx-auto mt-3 text-base">
          Nhập mã vận đơn để xem trạng thái và hành trình. Không cần đăng nhập.
        </p>

        <form onSubmit={handleTrack} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            aria-label="Mã vận đơn"
            placeholder="Ví dụ VN-28491"
            className="h-11 flex-1"
          />
          <Button type="submit" size="lg" className="shrink-0 sm:px-8">
            Tra cứu
          </Button>
        </form>
      </div>
    </section>
  );
}
