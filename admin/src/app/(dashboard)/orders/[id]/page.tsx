'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Barcode,
  Package,
  User,
  MapPin,
  Wallet,
  History,
  ExternalLink,
  ShoppingCart,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ordersService, type Order } from '@/services/orders.service';
import { walletTransactionsService, type WalletTransaction } from '@/services/wallet-transactions.service';
import { orderStatusLabels } from '@/lib/order-status';
import { orderTypeLabels, orderTypeBadgeColors } from '@/lib/order-type';
import { formatCny } from '@/lib/currency';
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [walletAmount, setWalletAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOrder = async () => {
    const res = await ordersService.getById(id);
    setOrder(res.data);
  };

  const loadTransactions = async () => {
    try {
      const res = await walletTransactionsService.getAll({ orderId: id, limit: 50 });
      setTransactions(res.data.data ?? res.data);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadOrder()
      .catch(() => toast.error('Không thể tải thông tin đơn hàng'))
      .finally(() => setLoading(false));
    loadTransactions();
  }, [id]);

  const handleWalletAction = async (type: 'ORDER_DEPOSIT' | 'ORDER_PAYMENT' | 'ORDER_REFUND') => {
    const amount = Number(walletAmount);
    if (!amount || amount <= 0) {
      toast.error('Nhập số tiền ¥ hợp lệ');
      return;
    }
    if (!order?.customer) {
      toast.error('Đơn hàng chưa gắn khách hàng');
      return;
    }

    try {
      setSubmitting(true);
      if (type === 'ORDER_REFUND') {
        await ordersService.refundWallet(order.id, { amount });
        toast.success('Đã hoàn tiền vào ví khách hàng');
      } else {
        await ordersService.chargeWallet(order.id, { type, amount });
        toast.success(type === 'ORDER_DEPOSIT' ? 'Đã trừ ví — đặt cọc' : 'Đã trừ ví — thanh toán đơn');
      }
      setWalletAmount('');
      await Promise.all([loadOrder(), loadTransactions()]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-muted-foreground">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/orders"
        className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2 -ml-2')}
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Barcode className="w-4 h-4" /> Mã vận đơn
            </p>
            <h1 className="text-2xl font-bold font-mono">{order.billOfLadingCode}</h1>
            <Badge variant="outline" className={`mt-2 ${orderTypeBadgeColors[order.type]}`}>
              {orderTypeLabels[order.type]}
            </Badge>
          </div>
          <Badge variant="outline">{orderStatusLabels[order.status]}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Người gửi
            </h3>
            <p>{order.senderName}</p>
            <p className="text-sm text-muted-foreground">{order.senderPhone}</p>
            <p className="text-sm flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {order.senderAddress}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Người nhận
            </h3>
            <p>{order.receiverName}</p>
            <p className="text-sm text-muted-foreground">{order.receiverPhone}</p>
            <p className="text-sm flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {order.receiverAddress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Phí vận chuyển</p>
            <p className="font-semibold">{formatCurrency(order.feeTransfer)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tổng phí</p>
            <p className="font-semibold text-primary">{formatCurrency(order.totalFee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đã đặt cọc (¥)</p>
            <p className="font-semibold">{formatCny((order as any).depositAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đã TT từ ví (¥)</p>
            <p className="font-semibold">{formatCny((order as any).walletPaidAmount ?? 0)}</p>
          </div>
        </div>

        {order.customer && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Khách hàng</p>
            <Link
              href={`/customers/${order.customer.id}`}
              className="font-medium text-primary hover:underline"
            >
              {order.customer.fullName} — {order.customer.phone}
            </Link>
          </div>
        )}

        {order.description && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Package className="w-4 h-4" /> Mô tả hàng hoá
            </p>
            <p>{order.description}</p>
          </div>
        )}

        {/* Aggregator order items */}
        {order.items && order.items.length > 0 && (
          <div className="pt-4 border-t">
            <p className="font-semibold flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-primary" /> Sản phẩm đặt mua
              {order.shopName && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  — {order.shopName}
                  {order.shopUrl && (
                    <a href={order.shopUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline inline-flex items-center gap-0.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </span>
              )}
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sản phẩm</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-20">Đơn giá</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-16">SL</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-24">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <div className="flex items-start gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-12 w-12 shrink-0 rounded object-cover border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm">{item.title}</p>
                            {item.properties && item.properties.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.properties.map((p) => `${p.name}: ${p.value}`).join(', ')}
                              </p>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline mt-0.5"
                              >
                                Xem nguồn <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">¥{Number(item.priceCny).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-bold text-primary">¥{Number(item.totalCny).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-semibold">Tổng hàng:</td>
                    <td className="px-3 py-2 text-right font-bold text-primary">
                      ¥{order.items.reduce((s, i) => s + Number(i.totalCny), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {order.customer && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Thanh toán từ ví khách hàng
          </h3>
          <p className="text-sm text-muted-foreground">
            Trừ số dư ¥ của khách để đặt cọc hoặc thanh toán đơn. Mỗi thao tác được ghi vào lịch sử giao dịch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label>Số tiền (¥)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => handleWalletAction('ORDER_DEPOSIT')}
            >
              Đặt cọc
            </Button>
            <Button disabled={submitting} onClick={() => handleWalletAction('ORDER_PAYMENT')}>
              Thanh toán đơn
            </Button>
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={() => handleWalletAction('ORDER_REFUND')}
            >
              Hoàn tiền
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Lịch sử giao dịch đơn hàng
        </div>
        <WalletTransactionTable
          transactions={transactions}
          loading={txLoading}
          showCustomer={false}
          emptyMessage="Chưa có giao dịch ví liên quan đơn này."
        />
      </div>
    </div>
  );
}
