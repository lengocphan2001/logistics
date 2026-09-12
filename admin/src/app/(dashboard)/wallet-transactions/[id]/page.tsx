'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AtSign,
  CheckCircle,
  Loader2,
  User,
  Wallet,
  XCircle,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { icon } from '@/lib/icon';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-error';
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
import { orderStatusLabels } from '@/lib/order-status';
import { orderTypeLabels } from '@/lib/order-type';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-[var(--graphite)]">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function WalletTransactionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [tx, setTx] = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadTransaction = async () => {
    const res = await walletTransactionsService.getById(id);
    setTx(res.data.data ?? res.data);
  };

  useEffect(() => {
    if (!id) return;
    loadTransaction()
      .catch(() => toast.error('Không thể tải giao dịch'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await walletTransactionsService.approve(id);
      toast.success('Đã duyệt giao dịch');
      await loadTransaction();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Thao tác trên giao dịch thất bại'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setProcessing(true);
      await walletTransactionsService.reject(id, rejectReason.trim());
      toast.success('Đã từ chối giao dịch');
      setRejectOpen(false);
      setRejectReason('');
      await loadTransaction();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Thao tác trên giao dịch thất bại'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tx) {
    return <div className="p-6 text-[var(--graphite)]">Không tìm thấy giao dịch.</div>;
  }

  const credit = isWalletCredit(tx.type);

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/wallet-transactions"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2 -ml-2')}
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <div className="bg-card rounded-[var(--radius-panel)] border border-border p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--graphite)] flex items-center gap-1">
              <Wallet className="w-4 h-4" /> Mã giao dịch
            </p>
            <h1 className="text-2xl font-bold font-mono">{tx.code}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={walletTransactionTypeBadgeColors[tx.type]}>
                {walletTransactionTypeLabels[tx.type]}
              </Badge>
              <Badge variant="outline" className={walletTransactionStatusBadgeColors[tx.status]}>
                {walletTransactionStatusLabels[tx.status]}
              </Badge>
            </div>
          </div>

          {tx.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button size="sm" disabled={processing} onClick={handleApprove}>
                <CheckCircle className="w-4 h-4" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={processing}
                onClick={() => {
                  setRejectOpen(true);
                  setRejectReason('');
                }}
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
          <DetailRow label="Số tiền (CNY)">
            <p
              className={cn(
                'text-lg font-bold',
                credit ? 'text-[var(--ledger-green)]' : 'text-[var(--ink)]',
              )}
            >
              {credit ? '+' : '−'}
              {formatCny(tx.amount)}
            </p>
          </DetailRow>
          <DetailRow label="Quy đổi VND">
            {tx.vndAmount != null && Number(tx.vndAmount) > 0 ? (
              <p className="font-semibold">{formatVnd(tx.vndAmount)}</p>
            ) : (
              '—'
            )}
          </DetailRow>
          <DetailRow label="Tỉ giá">
            {tx.exchangeRate != null ? (
              <p>1¥ = {Number(tx.exchangeRate).toLocaleString('vi-VN')}đ</p>
            ) : (
              '—'
            )}
          </DetailRow>
          <DetailRow label="Số dư trước">
            {tx.balanceBefore != null ? formatCny(tx.balanceBefore) : '—'}
          </DetailRow>
          <DetailRow label="Số dư sau">
            {tx.balanceAfter != null ? (
              <span className="font-semibold">{formatCny(tx.balanceAfter)}</span>
            ) : (
              '—'
            )}
          </DetailRow>
          <DetailRow label="Mã tham chiếu CK">
            {tx.referenceCode || '—'}
          </DetailRow>
        </div>

        {tx.customer && (
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Khách hàng
            </h3>
            <Link
              href={`/customers/${tx.customer.id}`}
              className="font-medium text-primary hover:underline"
            >
              {tx.customer.fullName}
            </Link>
            <p className="text-sm text-[var(--graphite)] flex items-center gap-1">
              <AtSign className="w-3.5 h-3.5" /> {tx.customer.username} · {tx.customer.phone}
            </p>
            {tx.customer.balance != null && (
              <p className="text-sm">
                Số dư hiện tại: <span className="font-semibold">{formatCny(tx.customer.balance)}</span>
              </p>
            )}
          </div>
        )}

        {tx.order && (
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold">Đơn hàng liên quan</h3>
            <Link
              href={`/orders/${tx.order.id}`}
              className="font-mono text-primary hover:underline"
            >
              {tx.order.billOfLadingCode}
            </Link>
            <p className="text-sm text-[var(--graphite)]">
              {orderTypeLabels[tx.order.type as keyof typeof orderTypeLabels] ?? tx.order.type}
              {' · '}
              {orderStatusLabels[tx.order.status as keyof typeof orderStatusLabels] ?? tx.order.status}
            </p>
          </div>
        )}

        {(tx.note || tx.rejectReason) && (
          <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            {tx.note && (
              <DetailRow label="Ghi chú">
                <p className="whitespace-pre-wrap">{tx.note}</p>
              </DetailRow>
            )}
            {tx.rejectReason && (
              <DetailRow label="Lý do từ chối">
                <p className="whitespace-pre-wrap text-destructive">{tx.rejectReason}</p>
              </DetailRow>
            )}
          </div>
        )}

        <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <DetailRow label="Tạo lúc">
            {new Date(tx.createdAt).toLocaleString('vi-VN')}
          </DetailRow>
          <DetailRow label="Cập nhật lúc">
            {new Date(tx.updatedAt).toLocaleString('vi-VN')}
          </DetailRow>
          <DetailRow label="Xử lý bởi">
            {tx.processedBy ? (
              <>
                <p className="font-medium">{tx.processedBy.name}</p>
                <p className="text-xs text-[var(--graphite)]">{tx.processedBy.email}</p>
              </>
            ) : (
              '—'
            )}
          </DetailRow>
          <DetailRow label="Xử lý lúc">
            {tx.processedAt ? new Date(tx.processedAt).toLocaleString('vi-VN') : '—'}
          </DetailRow>
        </div>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Từ chối giao dịch"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={processing}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? (
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
