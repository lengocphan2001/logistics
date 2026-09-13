'use client';

import { useCallback, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/layout/FilterBar';
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect';
import {
  walletTransactionsService,
  type WalletTransaction,
} from '@/services/wallet-transactions.service';
import {
  WALLET_TRANSACTION_TYPES,
  WALLET_TRANSACTION_STATUSES,
  walletTransactionTypeLabels,
  walletTransactionStatusLabels,
} from '@/lib/wallet-transaction';
import { apiErrorMessage } from '@/lib/api-error';
import { downloadFile } from '@/lib/download';
import { icon } from '@/lib/icon';

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/wallet-transactions/export', {
        search: searchQuery || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể xuất dữ liệu'));
    } finally {
      setExporting(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const txRes = await walletTransactionsService.getAll({
        limit: 100,
        search: searchQuery || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTransactions(txRes.data.data ?? txRes.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Lỗi khi tải lịch sử giao dịch'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, statusFilter]);

  useDebouncedEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await walletTransactionsService.approve(id);
      toast.success('Đã duyệt giao dịch');
      void fetchData();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể duyệt giao dịch'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setProcessingId(rejectId);
      await walletTransactionsService.reject(rejectId, rejectReason.trim());
      toast.success('Đã từ chối giao dịch');
      setRejectId(null);
      setRejectReason('');
      void fetchData();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể từ chối giao dịch'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lịch sử giao dịch ví"
        description="Duyệt yêu cầu nạp và rút của khách hàng, cùng các giao dịch phát sinh từ đơn hàng."
        action={
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            ) : (
              <Download {...icon('inline')} aria-hidden />
            )}
            Xuất Excel
          </Button>
        }
      />

      <FilterBar>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Tìm mã giao dịch, khách hàng, mã chuyển khoản"
            aria-label="Tìm giao dịch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger aria-label="Lọc theo loại giao dịch">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {WALLET_TRANSACTION_TYPES.map((key) => (
                <SelectItem key={key} value={key}>
                  {walletTransactionTypeLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Lọc theo trạng thái">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {WALLET_TRANSACTION_STATUSES.map((key) => (
                <SelectItem key={key} value={key}>
                  {walletTransactionStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <div className="panel overflow-hidden">
        <WalletTransactionTable
          transactions={transactions}
          loading={loading}
          showActions
          processingId={processingId}
          onApprove={handleApprove}
          onReject={(id) => {
            setRejectId(id);
            setRejectReason('');
          }}
        />
      </div>

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Từ chối giao dịch"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectId(null)} disabled={!!processingId}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!processingId}>
              {processingId ? (
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
              ) : (
                'Từ chối'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 px-5 py-4">
          <Label htmlFor="reject-reason">Lý do từ chối</Label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
