'use client';

import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCny, formatVnd } from '@/lib/currency';
import type { WalletTransaction } from '@/services/wallet-transactions.service';
import {
  walletTransactionTypeLabels,
  walletTransactionStatusLabels,
  walletTransactionTypeBadgeColors,
  walletTransactionStatusBadgeColors,
  isWalletCredit,
} from '@/lib/wallet-transaction';
import { cn } from '@/lib/utils';

interface WalletTransactionTableProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  emptyMessage?: string;
}

function WalletTransactionCard({ tx }: { tx: WalletTransaction }) {
  const credit = isWalletCredit(tx.type);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--portal-border)] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-sm font-semibold leading-snug">{tx.code}</p>
          <p className="mt-0.5 text-xs text-[var(--portal-muted)]">
            {new Date(tx.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('ml-auto shrink-0 font-normal', walletTransactionStatusBadgeColors[tx.status])}
        >
          {walletTransactionStatusLabels[tx.status]}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Badge variant="outline" className={cn('shrink-0', walletTransactionTypeBadgeColors[tx.type])}>
          {walletTransactionTypeLabels[tx.type]}
        </Badge>
        <span
          className={cn(
            'shrink-0 text-base font-bold tabular-nums',
            credit ? 'text-emerald-700' : 'text-orange-700',
          )}
        >
          {credit ? '+' : '-'}
          {formatCny(tx.amount)}
        </span>
      </div>
      {(tx.vndAmount != null || tx.balanceAfter != null || tx.referenceCode || tx.rejectReason) && (
        <div className="mt-2 space-y-1 text-xs text-[var(--portal-muted)]">
          {tx.vndAmount != null && <p>≈ {formatVnd(tx.vndAmount)}</p>}
          {tx.balanceAfter != null && <p>Số dư sau: {formatCny(tx.balanceAfter)}</p>}
          {tx.referenceCode && <p>CK: {tx.referenceCode}</p>}
          {tx.rejectReason && <p className="text-destructive">{tx.rejectReason}</p>}
        </div>
      )}
    </div>
  );
}

export function WalletTransactionTable({
  transactions,
  loading,
  emptyMessage = 'Chưa có giao dịch nào.',
}: WalletTransactionTableProps) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {transactions.map((tx) => (
          <WalletTransactionCard key={tx.id} tx={tx} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-foreground/65">
              <th className="px-4 py-3">Mã GD</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Số dư sau</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {transactions.map((tx) => {
              const credit = isWalletCredit(tx.type);
              return (
                <tr key={tx.id} className="transition-colors hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold">{tx.code}</p>
                    {tx.referenceCode && (
                      <p className="mt-0.5 text-xs text-muted-foreground">CK: {tx.referenceCode}</p>
                    )}
                    {tx.rejectReason && (
                      <p className="mt-0.5 text-xs text-destructive">{tx.rejectReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={walletTransactionTypeBadgeColors[tx.type]}>
                      {walletTransactionTypeLabels[tx.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${credit ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}
                    >
                      {credit ? '+' : '-'}
                      {formatCny(tx.amount)}
                    </span>
                    {tx.vndAmount != null && (
                      <p className="text-xs text-muted-foreground">{formatVnd(tx.vndAmount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tx.balanceAfter != null ? formatCny(tx.balanceAfter) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={walletTransactionStatusBadgeColors[tx.status]}>
                      {walletTransactionStatusLabels[tx.status]}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
