'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const txRes = await walletTransactionsService.getAll({
        limit: 100,
        search: searchQuery || undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTransactions(txRes.data.data ?? txRes.data);
    } catch (err: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, typeFilter, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await walletTransactionsService.approve(id);
      toast.success('Đã duyệt giao dịch');
      fetchData();
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
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
      fetchData();
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            Lịch sử giao dịch ví
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Xem và duyệt yêu cầu nạp/rút từ khách hàng, cùng các giao dịch đơn hàng.
            Khách hàng tự gửi yêu cầu nạp/rút trên website.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/80 p-4 rounded-2xl border border-border/70 shadow-sm backdrop-blur-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Tìm mã GD, khách hàng, mã CK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44 shrink-0">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
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
        <div className="w-full sm:w-44 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả TT</SelectItem>
              {WALLET_TRANSACTION_STATUSES.map((key) => (
                <SelectItem key={key} value={key}>
                  {walletTransactionStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-1">
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

      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
            >
              <h3 className="text-lg font-bold">Từ chối giao dịch</h3>
              <div className="space-y-1.5">
                <Label>Lý do từ chối</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  rows={3}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectId(null)} disabled={!!processingId}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!!processingId}>
                  {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Từ chối'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
