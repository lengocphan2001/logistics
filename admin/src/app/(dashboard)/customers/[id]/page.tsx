'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet, Phone, Mail, AtSign, MapPin, Package, History } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { customersService, type Customer } from '@/services/customers.service';
import { walletTransactionsService, type WalletTransaction } from '@/services/wallet-transactions.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';
import { genderLabels } from '@/lib/gender';
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';
import type { CustomerBankInfo } from '@/services/customers.service';

/** The customer endpoint embeds a short order list that has no shared type. */
type CustomerOrderSummary = {
  id: string;
  billOfLadingCode: string;
  status: string;
  totalFee: number | string;
  createdAt: string;
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { vndPerCny } = useExchangeRate();
  const [customer, setCustomer] = useState<(Customer & { orders?: CustomerOrderSummary[] }) | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await customersService.getById(id);
        setCustomer(res.data);
      } catch {
        toast.error('Không thể tải thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };
    const fetchTransactions = async () => {
      try {
        const res = await walletTransactionsService.getAll({ customerId: id, limit: 50 });
        setTransactions(res.data.data ?? res.data);
      } catch {
        /* ignore */
      } finally {
        setTxLoading(false);
      }
    };
    if (id) {
      fetchCustomer();
      fetchTransactions();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return <div className="p-6 text-[var(--graphite)]">Không tìm thấy khách hàng.</div>;
  }

  const bankInfo = customer.bankInfo as CustomerBankInfo | null | undefined;

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/customers"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2 -ml-2')}
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <div className="bg-card rounded-[var(--radius-panel)] border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{customer.fullName}</h1>
            <p className="text-[var(--graphite)] flex items-center gap-1 mt-1">
              <AtSign className="w-4 h-4" /> {customer.username}
            </p>
            <Badge variant="outline" className="mt-2">
              {customer.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--graphite)]" /> {customer.phone}</div>
          {customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--graphite)]" /> {customer.email}</div>}
          {customer.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--graphite)]" /> {customer.address}</div>}
          {customer.shippingAddress && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--graphite)]" />
              <span>Nhận hàng: {customer.shippingAddress}</span>
            </div>
          )}
          {customer.dateOfBirth && (
            <div className="text-sm text-[var(--graphite)]">
              Ngày sinh: {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')}
            </div>
          )}
          {customer.gender && (
            <div className="text-sm text-[var(--graphite)]">
              Giới tính: {genderLabels[customer.gender]}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--ledger-green)]">
              <Wallet className="w-4 h-4" /> Số dư: {formatCny(customer.balance)}
            </div>
            <p className="text-xs text-[var(--graphite)] pl-6">
              ≈ {formatVnd(cnyToVnd(customer.balance, vndPerCny))} (tỉ giá 1 ¥ = {formatVnd(vndPerCny)})
            </p>
          </div>
        </div>

        {customer.note && (
          <p className="text-sm text-[var(--graphite)] border-t pt-4">{customer.note}</p>
        )}

        {bankInfo?.bankName && (
          <div className="border-t pt-4 space-y-1 text-sm">
            <p className="font-semibold">Ngân hàng</p>
            <p>{bankInfo.bankName}</p>
            <p className="text-[var(--graphite)]">
              {bankInfo.accountNumber} — {bankInfo.accountHolder}
            </p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-[var(--radius-panel)] border border-border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <History className="w-4 h-4 text-primary" /> Lịch sử giao dịch ví
          </div>
          <Link
            href={`/wallet-transactions?customer=${id}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Xem tất cả
          </Link>
        </div>
        <WalletTransactionTable
          transactions={transactions}
          loading={txLoading}
          showCustomer={false}
          emptyMessage="Chưa có giao dịch ví nào."
        />
      </div>

      {customer.orders && customer.orders.length > 0 && (
        <div className="bg-card rounded-[var(--radius-panel)] border border-border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2 font-semibold">
            <Package className="w-4 h-4 text-primary" /> Đơn hàng gần đây
          </div>
          <div className="divide-y">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/10 transition-colors"
              >
                <span className="font-mono text-sm">{order.billOfLadingCode}</span>
                <span className="text-sm text-[var(--graphite)]">{order.status}</span>
                <span className="text-sm font-medium">{formatVnd(order.totalFee)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
