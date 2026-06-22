'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { walletTransactionsService } from '@/services/wallet-transactions.service';
import { profileService } from '@/services/profile.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';

function WalletRequestForm() {
  const searchParams = useSearchParams();
  const { vndPerCny } = useExchangeRate();
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [vndAmount, setVndAmount] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState<number | string>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t === 'DEPOSIT' || t === 'WITHDRAWAL') setType(t);
  }, [searchParams]);

  useEffect(() => {
    profileService.get().then((res) => setBalance(res.data.balance ?? 0));
  }, []);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val);
    setVndAmount(num > 0 ? String(Math.round(num * vndPerCny)) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      await walletTransactionsService.request({
        type,
        amount: num,
        vndAmount: vndAmount ? Number(vndAmount) : undefined,
        referenceCode: referenceCode.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success('Đã gửi yêu cầu. Vui lòng chờ admin duyệt.');
      setAmount('');
      setVndAmount('');
      setReferenceCode('');
      setNote('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {type === 'DEPOSIT' ? (
            <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
          ) : (
            <ArrowUpFromLine className="w-6 h-6 text-orange-600" />
          )}
          {type === 'DEPOSIT' ? 'Yêu cầu nạp tiền' : 'Yêu cầu rút tiền'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Số dư hiện tại: {formatCny(balance)} (≈ {formatVnd(cnyToVnd(balance, vndPerCny))})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Loại giao dịch</Label>
          <Select value={type} onValueChange={(v) => setType(v as 'DEPOSIT' | 'WITHDRAWAL')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEPOSIT">Nạp tiền</SelectItem>
              <SelectItem value="WITHDRAWAL">Rút tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Số tiền (¥)</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            required
          />
          <p className="text-xs text-muted-foreground">
            ≈ {vndAmount ? formatVnd(vndAmount) : '—'} (1 ¥ = {formatVnd(vndPerCny)})
          </p>
        </div>

        {type === 'DEPOSIT' && (
          <div className="space-y-1.5">
            <Label>Mã tham chiếu chuyển khoản</Label>
            <Input
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Mã FT / nội dung CK..."
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Ghi chú</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ghi chú thêm (nếu có)"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Yêu cầu sẽ ở trạng thái chờ duyệt. Admin xác nhận trước khi cập nhật số dư.
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi yêu cầu'}
        </Button>
      </form>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <WalletRequestForm />
    </Suspense>
  );
}
