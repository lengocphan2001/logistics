'use client';

import { Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCny, formatVnd } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
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
    <div className="border border-[var(--rule)] bg-[var(--sheet-white)] p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-sm font-semibold leading-snug">{tx.code}</p>
          <p className="mt-0.5 text-xs text-[var(--graphite)]">
            {formatDateTime(tx.createdAt)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'ml-auto shrink-0 font-normal',
            walletTransactionStatusBadgeColors[tx.status],
          )}
        >
          {walletTransactionStatusLabels[tx.status]}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Badge
          variant="outline"
          className={cn('shrink-0', walletTransactionTypeBadgeColors[tx.type])}
        >
          {walletTransactionTypeLabels[tx.type]}
        </Badge>
        <span
          data-numeric
          className={cn(
            'shrink-0 text-base font-bold',
            credit ? 'text-[var(--ledger-green)]' : 'text-[var(--ink)]',
          )}
        >
          {credit ? '+' : '-'}
          {formatCny(tx.amount)}
        </span>
      </div>

      {(tx.vndAmount != null ||
        tx.balanceAfter != null ||
        tx.referenceCode ||
        tx.rejectReason) && (
        <div className="mt-2 space-y-1 text-xs text-[var(--graphite)]">
          {tx.vndAmount != null && <p>≈ {formatVnd(tx.vndAmount)}</p>}
          {tx.balanceAfter != null && <p>Số dư sau: {formatCny(tx.balanceAfter)}</p>}
          {tx.referenceCode && <p>CK: {tx.referenceCode}</p>}
          {tx.rejectReason && <p className="text-[var(--seal-red)]">{tx.rejectReason}</p>}
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
    return <LoadingState className="py-14" />;
  }

  if (transactions.length === 0) {
    return <EmptyState icon={Wallet} title={emptyMessage} className="border-0 py-14" />;
  }

  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {transactions.map((tx) => (
          <WalletTransactionCard key={tx.id} tx={tx} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Số dư sau</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const credit = isWalletCredit(tx.type);
              return (
                <TableRow key={tx.id}>
                  <TableCell className="align-top">
                    <p className="font-mono text-xs font-semibold">{tx.code}</p>
                    {tx.referenceCode && (
                      <p className="mt-0.5 text-xs text-[var(--graphite)]">
                        CK: {tx.referenceCode}
                      </p>
                    )}
                    {tx.rejectReason && (
                      <p className="mt-0.5 text-xs text-[var(--seal-red)]">{tx.rejectReason}</p>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={walletTransactionTypeBadgeColors[tx.type]}
                    >
                      {walletTransactionTypeLabels[tx.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <span
                      data-numeric
                      className={cn(
                        'font-semibold',
                        credit ? 'text-[var(--ledger-green)]' : 'text-[var(--ink)]',
                      )}
                    >
                      {credit ? '+' : '-'}
                      {formatCny(tx.amount)}
                    </span>
                    {tx.vndAmount != null && (
                      <p data-numeric className="text-xs text-[var(--graphite)]">
                        {formatVnd(tx.vndAmount)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell data-numeric className="align-top text-[var(--graphite)]">
                    {tx.balanceAfter != null ? formatCny(tx.balanceAfter) : '—'}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={walletTransactionStatusBadgeColors[tx.status]}
                    >
                      {walletTransactionStatusLabels[tx.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top text-xs text-[var(--graphite)]">
                    {formatDateTime(tx.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
