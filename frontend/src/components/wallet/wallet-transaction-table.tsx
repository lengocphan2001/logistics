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

interface WalletTransactionTableProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  emptyMessage?: string;
}

export function WalletTransactionTable({
  transactions,
  loading,
  emptyMessage = 'Chưa có giao dịch nào.',
}: WalletTransactionTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border text-foreground/65 text-xs font-semibold uppercase tracking-wider">
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
              <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-mono font-semibold text-xs">{tx.code}</p>
                  {tx.referenceCode && (
                    <p className="text-xs text-muted-foreground mt-0.5">CK: {tx.referenceCode}</p>
                  )}
                  {tx.rejectReason && (
                    <p className="text-xs text-destructive mt-0.5">{tx.rejectReason}</p>
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
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleString('vi-VN')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
