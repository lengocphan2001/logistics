'use client';

import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, AtSign, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  walletTransactionsService,
  type WalletTransaction,
} from '@/services/wallet-transactions.service';
import { formatCny, formatVnd } from '@/lib/currency';
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
  showCustomer?: boolean;
  showActions?: boolean;
  processingId?: string | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  emptyMessage?: string;
}

export function WalletTransactionTable({
  transactions,
  loading,
  showCustomer = true,
  showActions = false,
  processingId,
  onApprove,
  onReject,
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
            {showCustomer && <th className="px-4 py-3">Khách hàng</th>}
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Số tiền</th>
            <th className="px-4 py-3">Số dư</th>
            <th className="px-4 py-3">Đơn hàng</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thời gian</th>
            {showActions && <th className="px-4 py-3 text-right">Hành động</th>}
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
                    <p className="text-xs text-muted-foreground">CK: {tx.referenceCode}</p>
                  )}
                </td>
                {showCustomer && (
                  <td className="px-4 py-3">
                    {tx.customer ? (
                      <div>
                        <Link
                          href={`/customers/${tx.customer.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {tx.customer.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <AtSign className="w-3 h-3" /> {tx.customer.username}
                        </p>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <Badge variant="outline" className={walletTransactionTypeBadgeColors[tx.type]}>
                    {walletTransactionTypeLabels[tx.type]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p
                    className={`font-semibold ${
                      credit ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'
                    }`}
                  >
                    {credit ? '+' : '−'}
                    {formatCny(tx.amount)}
                  </p>
                  {tx.vndAmount != null && Number(tx.vndAmount) > 0 && (
                    <p className="text-xs text-muted-foreground">≈ {formatVnd(tx.vndAmount)}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {tx.balanceBefore != null && tx.balanceAfter != null ? (
                    <>
                      <p>{formatCny(tx.balanceBefore)}</p>
                      <p className="text-foreground font-medium">→ {formatCny(tx.balanceAfter)}</p>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  {tx.order ? (
                    <Link
                      href={`/orders/${tx.order.id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {tx.order.billOfLadingCode}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={walletTransactionStatusBadgeColors[tx.status]}>
                    {walletTransactionStatusLabels[tx.status]}
                  </Badge>
                  {tx.note && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tx.note}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleString('vi-VN')}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/wallet-transactions/${tx.id}`}
                        title="Xem chi tiết"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7 px-2')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {tx.status === 'PENDING' && onApprove && onReject ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={processingId === tx.id}
                            onClick={() => onApprove(tx.id)}
                            title="Duyệt"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive"
                            disabled={processingId === tx.id}
                            onClick={() => onReject(tx.id)}
                            title="Từ chối"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function fetchWalletTransactions(params?: {
  customerId?: string;
  orderId?: string;
  limit?: number;
}) {
  const res = await walletTransactionsService.getAll({
    limit: params?.limit ?? 50,
    customerId: params?.customerId,
    orderId: params?.orderId,
  });
  return (res.data.data ?? res.data) as WalletTransaction[];
}
