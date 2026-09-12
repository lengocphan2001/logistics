'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PurchaseProgress } from '@/components/shop/PurchaseProgress';
import { icon } from '@/lib/icon';

/** Shown in place of the form once the orders exist. */
export function CheckoutSuccess({ orderCount }: { orderCount: number }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl space-y-6 py-12">
      <PurchaseProgress current="Hoàn tất" />
      <div className="panel p-8 text-center">
        <CheckCircle
          {...icon('page')}
          aria-hidden
          className="mx-auto mb-3 size-10 text-[var(--ledger-green)]"
        />
        <h1 className="font-heading text-xl font-bold text-[var(--ink)]">
          Đặt hàng thành công
        </h1>
        <p data-prose className="mx-auto mt-2 text-sm">
          Đã tạo <span data-numeric>{orderCount}</span> đơn hàng. Nhân viên sẽ xử lý và
          thông báo khi hàng về kho Việt Nam.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push('/orders')}>Xem đơn hàng</Button>
          <Button variant="outline" onClick={() => router.push('/shop')}>
            Tiếp tục mua hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
