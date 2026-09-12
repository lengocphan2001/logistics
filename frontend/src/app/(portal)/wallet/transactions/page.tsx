'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-error';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';
import {
  walletTransactionsService,
  type WalletTransaction,
} from '@/services/wallet-transactions.service';
import {
  walletTransactionTypeLabels,
  walletTransactionStatusLabels,
} from '@/lib/wallet-transaction';

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await walletTransactionsService.getMine({
        limit: 100,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTransactions(res.data.data ?? res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể tải lịch sử'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Ví"
        title="Lịch sử giao dịch"
        description="Toàn bộ giao dịch ví: nạp, rút, đặt cọc và thanh toán đơn hàng."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            {Object.entries(walletTransactionTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.entries(walletTransactionStatusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-[var(--radius-panel)] border border-[var(--rule)] bg-[var(--sheet-white)]  md:overflow-hidden">
        <WalletTransactionTable transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}
