'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, History, Loader2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { profileService, type CustomerProfile } from '@/services/profile.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';

export default function DashboardPage() {
  const { vndPerCny } = useExchangeRate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService
      .get()
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const balance = profile?.balance ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Xin chào, {profile?.name}</h2>
        <p className="text-muted-foreground text-sm mt-1">Quản lý ví và đơn hàng của bạn</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Wallet className="w-5 h-5" />
          <span className="font-semibold">Số dư ví</span>
        </div>
        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatCny(balance)}</p>
        <p className="text-sm text-muted-foreground">≈ {formatVnd(cnyToVnd(balance, vndPerCny))}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/wallet?type=DEPOSIT" className={cn(buttonVariants(), 'gap-2')}>
            <ArrowDownToLine className="w-4 h-4" /> Nạp tiền
          </Link>
          <Link
            href="/wallet?type=WITHDRAWAL"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <ArrowUpFromLine className="w-4 h-4" /> Rút tiền
          </Link>
          <Link
            href="/wallet/transactions"
            className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2')}
          >
            <History className="w-4 h-4" /> Lịch sử giao dịch
          </Link>
        </div>
      </div>
    </div>
  );
}
