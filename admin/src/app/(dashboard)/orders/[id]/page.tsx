'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { OrderActionBar } from '@/components/orders/workflow/OrderActionBar';
import {
  OrderActionModal,
  type WarehouseOption,
} from '@/components/orders/workflow/OrderActionModal';
import { OrderAmountsPanel } from '@/components/orders/workflow/OrderAmountsPanel';
import { OrderItemsPanel } from '@/components/orders/workflow/OrderItemsPanel';
import { OrderTimeline } from '@/components/orders/workflow/OrderTimeline';
import { WalletTransactionTable } from '@/components/wallet/wallet-transaction-table';
import { apiErrorMessage } from '@/lib/api-error';
import { formatDateTime } from '@/lib/date';
import { icon } from '@/lib/icon';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { orderStatusBadgeColors } from '@/lib/order-status';
import { orderTypeBadgeColors, orderTypeLabels } from '@/lib/order-type';
import { isQuoteExpired, isQuoteOverdue, type OrderActionKey } from '@/lib/order-workflow';
import { ordersService, type OrderSummary } from '@/services/orders.service';
import {
  walletTransactionsService,
  type WalletTransaction,
} from '@/services/wallet-transactions.service';

type StaffOption = { id: string; name: string; role: string; status: string };

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [action, setAction] = useState<OrderActionKey | null>(null);
  const [assigning, setAssigning] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await walletTransactionsService.getAll({ orderId: id, limit: 50 });
      setTransactions(res.data.data ?? res.data);
    } finally {
      setTxLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    void (async () => {
      try {
        const [summaryRes, warehousesRes, staffRes] = await Promise.all([
          ordersService.getSummary(id),
          api.get('/warehouses'),
          api.get('/users').catch(() => ({ data: [] })),
        ]);
        setSummary(summaryRes.data);
        setWarehouses(warehousesRes.data);
        setStaff((staffRes.data?.data ?? staffRes.data ?? []) as StaffOption[]);
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Không thể tải thông tin đơn hàng'));
      } finally {
        setLoading(false);
      }
    })();

    void loadTransactions();
  }, [id, loadTransactions]);

  const applySummary = (next: OrderSummary) => {
    setSummary(next);
    void loadTransactions();
  };

  const handleAssign = async (value: string) => {
    setAssigning(true);
    try {
      await ordersService.assign(id, value === 'none' ? null : value);
      const res = await ordersService.getSummary(id);
      setSummary(res.data);
      toast.success('Đã cập nhật người phụ trách');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không đổi được người phụ trách'));
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải đơn hàng" className="py-24" />;
  }

  if (!summary) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng"
        hint="Đơn có thể đã bị xoá hoặc đường dẫn không đúng."
      />
    );
  }

  const { order, amounts, flow, statusLabel } = summary;
  const overdue = isQuoteOverdue(order);
  const expired = isQuoteExpired(order);
  const activeStaff = staff.filter((s) => s.status === 'ACTIVE');

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Đã chép');
    } catch {
      toast.error('Trình duyệt không cho phép chép');
    }
  };

  return (
    <div className="space-y-5">
      <Link
        href="/orders"
        className={cn(buttonVariants({ variant: 'ghost' }), '-ml-2 gap-2')}
      >
        <ArrowLeft {...icon('inline')} aria-hidden />
        Quay lại danh sách
      </Link>

      <PageHeader
        title={order.billOfLadingCode}
        description={`${orderTypeLabels[order.type]} — ${statusLabel}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={orderTypeBadgeColors[order.type]}>
              {orderTypeLabels[order.type]}
            </Badge>
            <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
              {statusLabel}
            </Badge>
          </div>
        }
      />

      {(overdue || expired) && (
        <p className="border border-[var(--seal-red)] bg-[var(--red-wash)] px-4 py-3 text-sm text-[var(--seal-red)]">
          {overdue
            ? 'Yêu cầu này đã chờ báo giá quá lâu.'
            : 'Báo giá đã hết hạn, khách không duyệt được nữa. Hãy báo giá lại.'}
        </p>
      )}

      <section className="panel px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="mb-3 font-heading text-base font-semibold text-[var(--ink)]">
              Bước tiếp theo
            </h2>
            <OrderActionBar
              summary={summary}
              busy={assigning}
              onAction={setAction}
            />
          </div>

          <div className="w-full space-y-1.5 lg:w-64">
            <Label htmlFor="order-assignee">Người phụ trách</Label>
            <Select
              value={order.assignedToId ?? 'none'}
              onValueChange={(value) => void handleAssign(value)}
            >
              <SelectTrigger id="order-assignee" disabled={assigning}>
                <SelectValue placeholder="Chưa giao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Chưa giao</SelectItem>
                {activeStaff.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="panel">
            <h2 className="border-b border-[var(--rule)] px-5 py-3.5 font-heading text-base font-semibold text-[var(--ink)]">
              Thông tin đơn
            </h2>

            <div className="grid grid-cols-1 gap-5 px-5 py-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">Người gửi</h3>
                <p className="mt-1 text-sm text-[var(--ink)]">{order.senderName}</p>
                <p data-numeric className="text-sm text-[var(--graphite)]">
                  {order.senderPhone}
                </p>
                <p data-prose className="text-sm">
                  {order.senderAddress}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">Người nhận</h3>
                <p className="mt-1 text-sm text-[var(--ink)]">{order.receiverName}</p>
                <p data-numeric className="text-sm text-[var(--graphite)]">
                  {order.receiverPhone}
                </p>
                <p data-prose className="text-sm">
                  {order.receiverAddress}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 border-t border-[var(--rule)] px-5 py-4 sm:grid-cols-2">
              {order.customer && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Khách hàng</dt>
                  <dd className="text-sm">
                    <Link
                      href={`/customers/${order.customer.id}`}
                      className="font-medium text-[var(--manifest-navy)] hover:underline"
                    >
                      {order.customer.fullName}
                    </Link>
                    <span data-numeric className="ml-2 text-[var(--graphite)]">
                      {order.customer.phone}
                    </span>
                  </dd>
                </div>
              )}

              {order.assignedTo && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Đang xử lý</dt>
                  <dd className="text-sm text-[var(--ink)]">
                    {order.assignedTo.name}
                    {order.assignedAt && (
                      <span data-numeric className="ml-2 text-xs text-[var(--graphite)]">
                        {formatDateTime(order.assignedAt)}
                      </span>
                    )}
                  </dd>
                </div>
              )}

              {[
                ['Mã đơn khách cung cấp', order.sourceOrderCode],
                ['Mã đơn nhân viên mua', order.purchaseOrderCode],
                ['Mã vận đơn nội địa Trung Quốc', order.sourceTrackingCode],
              ]
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-xs text-[var(--graphite)]">{label}</dt>
                    <dd className="flex items-center gap-2">
                      <span data-numeric className="text-sm font-semibold text-[var(--ink)]">
                        {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copy(String(value))}
                        aria-label={`Chép ${label}`}
                        className="text-[var(--graphite)] hover:text-[var(--ink)]"
                      >
                        <Copy {...icon('inline')} aria-hidden />
                      </button>
                    </dd>
                  </div>
                ))}

              {order.cnWarehouse && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Kho Trung Quốc</dt>
                  <dd className="text-sm text-[var(--ink)]">{order.cnWarehouse.name}</dd>
                </div>
              )}
              {order.warehouse && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Kho Việt Nam</dt>
                  <dd className="text-sm text-[var(--ink)]">{order.warehouse.name}</dd>
                </div>
              )}
              {order.weight && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Khối lượng</dt>
                  <dd data-numeric className="text-sm text-[var(--ink)]">
                    {Number(order.weight)} kg
                  </dd>
                </div>
              )}
              {order.quoteExpiresAt && (
                <div>
                  <dt className="text-xs text-[var(--graphite)]">Báo giá hết hạn</dt>
                  <dd data-numeric className="text-sm text-[var(--ink)]">
                    {formatDateTime(order.quoteExpiresAt)}
                  </dd>
                </div>
              )}
            </dl>

            {(order.description || order.note) && (
              <div className="border-t border-[var(--rule)] px-5 py-4">
                {order.description && (
                  <p data-prose className="text-sm">
                    {order.description}
                  </p>
                )}
                {order.note && (
                  <p data-prose className="mt-2 text-sm text-[var(--graphite)]">
                    {order.note}
                  </p>
                )}
              </div>
            )}
          </section>

          <OrderItemsPanel
            order={order}
            editable={order.status !== 'CANCELLED' && order.status !== 'COMPLETED'}
            onChanged={applySummary}
          />

          <section className="panel overflow-hidden">
            <h2 className="border-b border-[var(--rule)] px-5 py-3.5 font-heading text-base font-semibold text-[var(--ink)]">
              Giao dịch ví của đơn
            </h2>
            <WalletTransactionTable
              transactions={transactions}
              loading={txLoading}
              showCustomer={false}
              emptyMessage="Chưa có giao dịch ví liên quan đơn này."
            />
          </section>
        </div>

        <div className="space-y-5">
          <OrderAmountsPanel order={order} amounts={amounts} />
          <OrderTimeline
            flow={flow}
            currentStatus={order.status}
            events={order.events ?? []}
          />
        </div>
      </div>

      <OrderActionModal
        action={action}
        summary={summary}
        warehouses={warehouses}
        onClose={() => setAction(null)}
        onDone={applySummary}
      />
    </div>
  );
}
